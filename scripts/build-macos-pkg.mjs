import assert from 'node:assert/strict';
import { chmod, copyFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    createBuildRun,
    formatBuildLog,
    persistBuildFailure,
    removeBuildRun,
    stageVerifiedArtifact,
} from './build-artifacts.mjs';

assert.equal(process.platform, 'darwin', 'The native macOS .pkg installer must be built on macOS.');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const version = packageJson.version;

const ARCH_CONFIG = {
    arm64: {
        hostArch: 'arm64',
        label: 'Apple Silicon',
    },
    x64: {
        hostArch: 'x86_64',
        label: 'Intel',
    },
};

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
    const arches = !arch || arch === 'all' ? ['arm64', 'x64'] : [arch];
    for (const item of arches) {
        assert(Object.hasOwn(ARCH_CONFIG, item),
            `Unsupported macOS architecture "${item}". Use --arch=arm64, --arch=x64, or --arch=all.`);
    }
    const outputDirectory = resolve(outputArgument || resolve(root, 'release-assets', version));
    return { arches, outputDirectory };
}

async function buildArch(arch, outputDirectory) {
    const config = ARCH_CONFIG[arch];
    const run = await createBuildRun({ platform: `macos-${arch}`, version });
    const keepRun = process.env.PULVIS_KEEP_BUILD_TEMP === '1';
    const logParts = [];

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

    try {
        const pkgRoot = resolve(run.workDirectory, 'pkg-root');
        const supportDir = resolve(pkgRoot, 'Library/Application Support/Pulvis');
        const payloadDir = resolve(supportDir, 'payload');
        const scriptsDir = resolve(run.workDirectory, 'pkg-scripts');
        const resourcesDir = resolve(run.workDirectory, 'pkg-resources');
        const componentPkg = resolve(run.workDirectory, 'pulvis-component.pkg');
        const distributionXml = resolve(run.workDirectory, 'distribution.xml');
        const outputName = `Pulvis-${version}-macos-${arch}.pkg`;
        const finalPkg = resolve(run.workDirectory, outputName);
        const verifyDir = resolve(run.workDirectory, 'verify-expand');

        await mkdir(payloadDir, { recursive: true });
        await mkdir(scriptsDir, { recursive: true });
        await mkdir(resourcesDir, { recursive: true });

        for (const rel of PAYLOAD_FILES) {
            const src = resolve(root, rel);
            const dst = resolve(payloadDir, rel);
            await mkdir(dirname(dst), { recursive: true });
            await copyFile(src, dst);
        }

        const manageDst = resolve(supportDir, 'pulvis-manage');
        await copyFile(resolve(root, 'installer/macos/pulvis-manage.jxa'), manageDst);
        await chmod(manageDst, 0o755);

        const postinstallDst = resolve(scriptsDir, 'postinstall');
        await copyFile(resolve(root, 'installer/macos/scripts/postinstall'), postinstallDst);
        await chmod(postinstallDst, 0o755);

        await cp(resolve(root, 'installer/macos/resources'), resourcesDir, { recursive: true });
        await copyFile(resolve(root, 'LICENSE'), resolve(resourcesDir, 'LICENSE'));

        const template = await readFile(resolve(root, 'installer/macos/distribution.xml.in'), 'utf8');
        const rendered = template
            .replaceAll('__APP_VERSION__', version)
            .replaceAll('__HOST_ARCH__', config.hostArch)
            .replaceAll('__ARCH_LABEL__', config.label);
        await writeFile(distributionXml, rendered, 'utf8');

        const pkgBuild = runCommand('pkgbuild', [
            '--root', pkgRoot,
            '--scripts', scriptsDir,
            '--identifier', 'com.csmodular.pulvis.pkg',
            '--version', version,
            '--install-location', '/',
            componentPkg,
        ]);
        assert.equal(pkgBuild.status, 0, `pkgbuild (${arch}) failed with exit code ${pkgBuild.status}.`);

        const productBuild = runCommand('productbuild', [
            '--distribution', distributionXml,
            '--resources', resourcesDir,
            '--package-path', run.workDirectory,
            finalPkg,
        ]);
        assert.equal(productBuild.status, 0, `productbuild (${arch}) failed with exit code ${productBuild.status}.`);

        const expand = runCommand('pkgutil', ['--expand', finalPkg, verifyDir]);
        assert.equal(expand.status, 0, `pkgutil --expand verification failed for ${outputName}.`);
        const expandedDist = await readFile(resolve(verifyDir, 'Distribution'), 'utf8');
        assert(expandedDist.includes(`hostArchitectures="${config.hostArch}"`),
            `Built macOS package must declare hostArchitectures="${config.hostArch}".`);

        const artifact = await stageVerifiedArtifact({
            sourcePath: finalPkg,
            outputDirectory,
            outputName,
            validate: async bytes => assert.equal(bytes.toString('ascii', 0, 4), 'xar!',
                'The macOS installer output is a valid xar-based .pkg archive.'),
        });
        console.log(`${artifact.output}\t${artifact.bytes}\t${artifact.sha256}`);
        console.log(`Build intermediates (${arch}): ${keepRun ? run.runDirectory : 'removed after package verification'}`);
    } catch (error) {
        const log = [...logParts, formatBuildLog({ command: `Native macOS ${arch} .pkg build`, error })].join('\n\n');
        const failureLog = await persistBuildFailure(run, log, {
            keepRun,
            failureDirectory: resolve(root, 'test-results/build-logs'),
        });
        console.error(`macOS ${arch} .pkg build failed; diagnostic log: ${failureLog}`);
        throw error;
    } finally {
        if (!keepRun) await removeBuildRun(run);
    }
}

const { arches, outputDirectory } = parseArgs(process.argv.slice(2));
for (const arch of arches) {
    await buildArch(arch, outputDirectory);
}
