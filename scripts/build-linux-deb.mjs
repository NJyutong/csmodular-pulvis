import assert from 'node:assert/strict';
import { chmod, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    createBuildRun,
    formatBuildLog,
    persistBuildFailure,
    removeBuildRun,
    stageVerifiedArtifact,
} from './build-artifacts.mjs';

assert.equal(process.platform, 'linux', 'The Debian package must be built on Linux.');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const version = packageJson.version;
const outputDirectory = resolve(process.argv[2] || resolve(root, 'release-assets', version));
const run = await createBuildRun({ platform: 'linux', version });
const keepRun = process.env.PULVIS_KEEP_BUILD_TEMP === '1';
const logParts = [];

const PAYLOAD_FILES = [
    'modules/GrainFreeze.js',
    'modules/GrainFreeze.txt',
    'modules/GrainSample.js',
    'modules/GrainSample.txt',
    'modules/GrainOsc.js',
    'modules/GrainOsc.txt',
    '_index.json',
    '_meta.json',
    'README.md',
    'README.zh-CN.md',
    'README.ru.md',
    'LICENSE',
    'assets/pulvis-icon.png',
    'assets/pulvis-header-en.png',
    'assets/pulvis-social-preview.png',
    'assets/pulvis-header-zh-CN.png',
    'assets/pulvis-header-ru.png',
    'examples/pulvis-demo.json',
    'csound/GrainCore.txt',
];

function runCommand(command, args, options = {}) {
    const result = spawnSync(command, args, {
        cwd: options.cwd || root,
        env: options.env || process.env,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });
    const formatted = formatBuildLog({
        command: [command, ...args].join(' '),
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        error: result.error,
        status: result.status,
    });
    logParts.push(formatted);
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.error) throw result.error;
    return result;
}

let posixStageDir = null;
try {
    // Stage on the native POSIX temp filesystem so dpkg-deb sees valid 0755 permissions even under WSL.
    posixStageDir = await mkdtemp(resolve(tmpdir(), 'pulvis-deb-stage-'));
    const pkgRoot = resolve(posixStageDir, 'deb-root');
    const debianDir = resolve(pkgRoot, 'DEBIAN');
    const payloadDir = resolve(pkgRoot, 'usr/share/pulvis/payload');
    const binDir = resolve(pkgRoot, 'usr/bin');
    const docDir = resolve(pkgRoot, 'usr/share/doc/pulvis');

    await mkdir(pkgRoot, { recursive: true, mode: 0o755 });
    await chmod(pkgRoot, 0o755);
    await mkdir(debianDir, { recursive: true, mode: 0o755 });
    await chmod(debianDir, 0o755);
    await mkdir(payloadDir, { recursive: true, mode: 0o755 });
    await mkdir(binDir, { recursive: true, mode: 0o755 });
    await mkdir(docDir, { recursive: true, mode: 0o755 });

    let totalBytes = 0;
    for (const rel of PAYLOAD_FILES) {
        const src = resolve(root, rel);
        const dst = resolve(payloadDir, rel);
        await mkdir(dirname(dst), { recursive: true });
        await copyFile(src, dst);
        totalBytes += (await readFile(src)).length;
    }

    const manageSrc = resolve(root, 'installer/linux/pulvis-manage.py');
    const manageDst = resolve(binDir, 'pulvis-install');
    await copyFile(manageSrc, manageDst);
    await chmod(manageDst, 0o755);
    totalBytes += (await readFile(manageSrc)).length;

    await copyFile(resolve(root, 'LICENSE'), resolve(docDir, 'copyright'));

    const installedSizeKb = Math.max(1, Math.ceil(totalBytes / 1024));
    const control = [
        'Package: pulvis',
        `Version: ${version}`,
        'Section: sound',
        'Priority: optional',
        'Architecture: amd64',
        `Installed-Size: ${installedSizeKb}`,
        'Depends: python3',
        'Maintainer: Zhang Shengwei <https://github.com/NJyutong/csmodular-pulvis>',
        'Homepage: https://github.com/NJyutong/csmodular-pulvis',
        'Description: Pulvis granular synthesis plugin library for CsModular',
        ' Three original Csound granular synthesis modules for CsModular:',
        ' Grain Freeze, Grain Sample, and Grain Osc. Pure native Debian',
        ' package with no WebView, GTK, or WebKit runtime dependencies.',
        '',
    ].join('\n');
    await writeFile(resolve(debianDir, 'control'), control, 'utf8');
    await chmod(resolve(debianDir, 'control'), 0o644);

    const postinst = [
        '#!/bin/sh',
        'set -e',
        'if [ "$1" = "configure" ] && [ -x /usr/bin/pulvis-install ]; then',
        '    /usr/bin/pulvis-install auto-install || true',
        'fi',
        'exit 0',
        '',
    ].join('\n');
    await writeFile(resolve(debianDir, 'postinst'), postinst, 'utf8');
    await chmod(resolve(debianDir, 'postinst'), 0o755);

    const prerm = [
        '#!/bin/sh',
        'set -e',
        'if [ "$1" = "remove" ] || [ "$1" = "purge" ]; then',
        '    if [ -x /usr/bin/pulvis-install ]; then',
        '        /usr/bin/pulvis-install auto-uninstall || true',
        '    fi',
        'fi',
        'exit 0',
        '',
    ].join('\n');
    await writeFile(resolve(debianDir, 'prerm'), prerm, 'utf8');
    await chmod(resolve(debianDir, 'prerm'), 0o755);

    const outputName = `Pulvis-${version}-linux-x64.deb`;
    const builtDeb = resolve(run.workDirectory, outputName);
    const buildResult = runCommand('dpkg-deb', ['--root-owner-group', '--build', pkgRoot, builtDeb]);
    assert.equal(buildResult.status, 0, `dpkg-deb build failed with exit code ${buildResult.status}.`);

    const metadata = runCommand('dpkg-deb', ['--field', builtDeb, 'Version', 'Architecture', 'Package', 'Depends']);
    assert.equal(metadata.status, 0, 'Debian package metadata must be readable.');
    const fieldMap = new Map(
        metadata.stdout.trim().split(/\r?\n/).map(line => {
            const idx = line.indexOf(':');
            return idx > 0 ? [line.slice(0, idx).trim(), line.slice(idx + 1).trim()] : [line.trim(), ''];
        }),
    );
    assert.equal(fieldMap.get('Version'), version, 'Debian package version matches the plugin version.');
    assert.equal(fieldMap.get('Architecture'), 'amd64', 'Debian package architecture is amd64.');
    assert.equal(fieldMap.get('Package'), 'pulvis', 'Debian package name is pulvis.');
    assert(!metadata.stdout.toLowerCase().includes('webkit'), 'Debian package has no WebKit/WebView dependency.');

    const artifact = await stageVerifiedArtifact({
        sourcePath: builtDeb,
        outputDirectory,
        outputName,
        validate: async bytes => assert.equal(bytes.toString('ascii', 0, 8), '!<arch>\n',
            'The Linux installer output is a Debian ar archive.'),
    });
    console.log(`${artifact.output}\t${artifact.bytes}\t${artifact.sha256}`);
    console.log(`Build intermediates: ${keepRun ? run.runDirectory : 'removed after package verification'}`);
} catch (error) {
    const log = [...logParts, formatBuildLog({ command: 'Native Debian package build', error })].join('\n\n');
    const failureLog = await persistBuildFailure(run, log, {
        keepRun,
        failureDirectory: resolve(root, 'test-results/build-logs'),
    });
    console.error(`Linux Debian build failed; diagnostic log: ${failureLog}`);
    throw error;
} finally {
    if (posixStageDir) await rm(posixStageDir, { recursive: true, force: true });
    if (!keepRun) await removeBuildRun(run);
}
