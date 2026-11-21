import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    createBuildRun,
    formatBuildLog,
    persistBuildFailure,
    removeBuildRun,
    stageVerifiedArtifact,
} from './build-artifacts.mjs';

assert.equal(process.platform, 'win32', 'The native Windows installer must be built on Windows.');

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const version = packageJson.version;

const SUPPORTED_ARCHES = new Set(['x64', 'arm64']);

function parseArgs(argv) {
    let arch = null;
    let outputArgument = null;
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith('--arch=')) {
            arch = arg.slice('--arch='.length);
        } else if (arg === '--arch' && argv[i + 1]) {
            arch = argv[++i];
        } else if (!arg.startsWith('--') && !outputArgument) {
            outputArgument = arg;
        }
    }
    const arches = !arch || arch === 'all' ? ['x64', 'arm64'] : [arch];
    for (const item of arches) {
        assert(SUPPORTED_ARCHES.has(item),
            `Unsupported Windows architecture "${item}". Use --arch=x64, --arch=arm64, or --arch=all.`);
    }
    const outputDirectory = resolve(outputArgument || resolve(root, 'release-assets', version));
    return { arches, outputDirectory };
}

const { arches, outputDirectory } = parseArgs(process.argv.slice(2));

async function buildWindowsArch(arch) {
    const run = await createBuildRun({ platform: `windows-${arch}`, version });
    const keepRun = process.env.PULVIS_KEEP_BUILD_TEMP === '1';
    const logParts = [];
    let compiler = null;

    function runCommand(command, args, options = {}) {
        const result = spawnSync(command, args, {
            cwd: options.cwd || root,
            encoding: 'utf8',
            windowsHide: true,
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

    try {
        const script = resolve(root, 'installer/windows/pulvis.iss');
        const core = await readFile(resolve(root, 'csound/GrainCore.txt'));
        const coreSha256 = createHash('sha256').update(core).digest('hex');
        const candidates = [];
        if (process.env.ISCC_EXE) candidates.push(process.env.ISCC_EXE);
        if (process.env.INNO_SETUP_HOME) candidates.push(join(process.env.INNO_SETUP_HOME, 'ISCC.exe'));
        candidates.push(
            'D:/csmodular-tools/inno-setup-7.1.1/ISCC.exe',
            `${process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)'}/Inno Setup 7/ISCC.exe`,
            `${process.env.ProgramFiles || 'C:/Program Files'}/Inno Setup 7/ISCC.exe`,
        );
        for (const candidate of candidates) {
            try {
                await access(candidate);
                compiler = candidate;
                break;
            } catch {}
        }
        assert(compiler, 'Inno Setup 7.1.1 ISCC.exe not found. Set INNO_SETUP_HOME or ISCC_EXE.');
        await access(script);

        const versionCheck = runCommand(compiler, ['--version']);
        assert.equal(versionCheck.status, 0, 'Inno Setup compiler version check must succeed.');
        assert.match(versionCheck.stdout.trim(), /^7\./, 'Build with Inno Setup 7.x compiler.');

        const innoOutputDirectory = resolve(run.workDirectory, 'inno-output');
        await mkdir(innoOutputDirectory, { recursive: false });
        const outputName = `Pulvis-${version}-windows-${arch}.exe`;
        const innoName = `Pulvis-${version}-windows-${arch}`;
        const args = [
            `--define=AppVersion=${version}`,
            `--define=CoreSha256=${coreSha256}`,
            `--define=TargetArch=${arch}`,
            `--output-dir=${innoOutputDirectory}`,
            `--output-filename=${innoName}`,
            script,
        ];
        const result = runCommand(compiler, args);
        assert.equal(result.status, 0, `Inno Setup (${arch}) build failed with exit code ${result.status}.`);
        const source = resolve(innoOutputDirectory, outputName);
        const artifact = await stageVerifiedArtifact({
            sourcePath: source,
            outputDirectory,
            outputName,
            validate: async bytes => assert.equal(bytes.toString('ascii', 0, 2), 'MZ',
                'The Pulvis setup output is a Windows PE executable.'),
        });
        console.log(`${artifact.output}\t${artifact.bytes}\t${artifact.sha256}`);
        console.log(`Build intermediates (${arch}): ${keepRun ? run.runDirectory : 'removed after package verification'}`);
    } catch (error) {
        const log = [...logParts, formatBuildLog({ command: compiler || 'locate Inno Setup', error })].join('\n\n');
        const failureLog = await persistBuildFailure(run, log, {
            keepRun,
            failureDirectory: resolve(root, 'test-results/build-logs'),
        });
        console.error(`Windows ${arch} installer build failed; diagnostic log: ${failureLog}`);
        throw error;
    } finally {
        if (!keepRun) await removeBuildRun(run);
    }
}

for (const arch of arches) {
    await buildWindowsArch(arch);
}
