import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2];
const stageMode = mode === '--stage';
const archiveMode = mode === '--archive';
const candidateArgument = process.argv[stageMode || archiveMode ? 3 : 2];
const reportArgument = process.argv[stageMode || archiveMode ? 4 : 3];
const root = resolve(candidateArgument || resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const read = path => readFile(resolve(root, path), 'utf8');
const digest = contents => createHash('sha256').update(contents).digest('hex');
const packageJson = JSON.parse(await read('package.json'));
const metadata = JSON.parse(await read('_meta.json'));
const installPackage = JSON.parse(await read('installer/package.json'));
const lock = JSON.parse(await read('installer/package-lock.json'));
const tauri = JSON.parse(await read('installer/src-tauri/tauri.conf.json'));
const index = JSON.parse(await read('_index.json'));
const version = packageJson.version;

assert.equal(version, '0.0.5', 'Candidate package version');
assert.equal(metadata.version, version, '_meta version matches package');
assert.equal(metadata.name, 'pulvis', 'The internal library ID is Pulvis');
assert.equal(metadata.displayName, 'Pulvis', 'The host display-name field uses the standard string interface');
assert.deepEqual(metadata.displayNameI18n, { en: 'Pulvis', zh: '微粒', ru: 'Пульвис' }, 'Localized library names');
assert.equal(packageJson.name, 'pulvis', 'The source package uses the Pulvis name');
assert.equal(installPackage.name, 'pulvis-installer', 'Tauri npm package uses the Pulvis installer name');
assert.equal(installPackage.version, version, 'Tauri npm package version matches');
assert.equal(lock.packages[''].version, version, 'Tauri npm lock version matches');
assert.equal(tauri.version, version, 'Tauri bundle version matches');
assert.match(await read('installer/src-tauri/Cargo.toml'), new RegExp(`^version = "${version.replaceAll('.', '\\.') }"\\r?$`, 'm'));
const cargoLock = await read('installer/src-tauri/Cargo.lock');
assert.match(cargoLock, new RegExp(`name = "pulvis-installer"\\r?\\nversion = "${version.replaceAll('.', '\\.') }"`));
assert.match(await read('installer/ui/version.js'), new RegExp(`INSTALLER_VERSION = "${version}"`));
assert.deepEqual(tauri.bundle.icon, ['icons/icon.ico', 'icons/icon.png', 'icons/icon.icns'], 'Tauri uses repository-owned platform icons');
assert(!JSON.stringify(tauri.bundle).toLowerCase().includes('appimage'), 'Linux release packaging does not create an AppImage');
assert.equal(tauri.productName, 'Pulvis Installer', 'Tauri application product name');
assert(index.modules.length === 3 && index.modules.every(module => ['stable', 'passable'].includes(module.status)),
    'The public index contains exactly the three publishable modules');
assert.deepEqual(index.modules.map(module => module.name), ['GrainFreeze', 'GrainSample', 'GrainOsc'], 'Csound module identifiers stay unchanged');
assert.deepEqual(index.modules.map(module => module.displayName), ['Pulvis Grain Freeze', 'Pulvis Grain Sample', 'Pulvis Grain Osc']);

const expectedFiles = [
    'package.json', '_meta.json', '_index.json', 'csound/GrainCore.txt',
    'modules/GrainFreeze.js', 'modules/GrainFreeze.txt',
    'modules/GrainSample.js', 'modules/GrainSample.txt',
    'modules/GrainOsc.js', 'modules/GrainOsc.txt',
    'examples/pulvis-demo.json',
    'README.md', 'README.zh-CN.md', 'README.ru.md', 'LICENSE',
    'assets/pulvis-icon.png', 'requirements-release.txt',
    'installer/ui/pulvis-icon.png', 'installer/ui/version.js',
    'installer/src-tauri/icons/icon.png', 'installer/src-tauri/icons/icon.ico', 'installer/src-tauri/icons/icon.icns',
    'installer/package.json', 'installer/package-lock.json', 'installer/src-tauri/Cargo.toml',
    'installer/src-tauri/Cargo.lock', 'installer/src-tauri/tauri.conf.json', 'installer/src-tauri/src/lib.rs',
    'installer/windows/pulvis.iss', 'installer/windows/registration.ps1', 'installer/windows/wizard-image.png', 'installer/windows/wizard-small.png',
    'installer/macos/pulvis-manage.jxa', 'installer/macos/scripts/postinstall', 'installer/macos/distribution.xml.in',
    'installer/linux/pulvis-manage.py',
    'scripts/build-windows-installer.mjs', 'scripts/build-macos-pkg.mjs', 'scripts/build-macos-pkg.sh', 'scripts/build-linux-deb.mjs', 'scripts/build-linux-deb.sh',
    'installer/ui/app.js', 'installer/ui/index.html',
    'scripts/sync-version.mjs', 'scripts/build-icons.py', 'scripts/verify-icons.mjs', 'scripts/check-readmes.mjs',
    'scripts/build-artifacts.mjs', 'scripts/cleanup-build-task.mjs', 'scripts/package-source.mjs',
    'scripts/write-release-checksums.mjs', 'scripts/package-smoke.mjs',
    'docs/BUILDING.md', 'docs/TESTING.md', 'docs/GITHUB-SETUP.md', 'release-notes/0.0.5.md',
    'assets/pulvis-social-preview.png',
];
expectedFiles.push('SOURCES.md', 'assets/pulvis-header-en.png', 'assets/pulvis-header-zh-CN.png', 'assets/pulvis-header-ru.png');
if (!archiveMode) expectedFiles.push('.github/workflows/build-installers.yml');
if (!stageMode) expectedFiles.push('integration/csmodular.patch', 'integration/wav-session-compat.patch', 'integration/studio-upgrade.patch', 'integration/studio-display-update.patch', 'integration/studio-release-update.patch', 'integration/studio-live-update.patch', 'integration/display-menu.patch', 'scripts/build-modules.mjs', 'scripts/install.mjs');
if (!archiveMode && !stageMode) expectedFiles.push('scripts/check.mjs', 'scripts/check-suite.mjs', 'scripts/inventory-artifacts.mjs');
const hashes = {};
for (const path of expectedFiles) hashes[path] = digest(await readFile(resolve(root, path)));
assert.match(await read('requirements-release.txt'), /^Pillow==12\.3\.0\s*$/,
    'Icon regeneration uses the pinned release-only Pillow dependency');

const rust = await read('installer/src-tauri/src/lib.rs');
const libraryDirectory = rust.slice(rust.indexOf('fn library_directory('), rust.indexOf('fn update_host_library_registration('));
assert(libraryDirectory.includes('.and_then(Value::as_array)')
    && !libraryDirectory.includes('LEGACY_LIBRARY_NAME')
    && !libraryDirectory.includes('.iter().any'),
    'A fresh compatible host can register Pulvis during installation');
assert.match(rust, /libraries\.push\(Value::String\(LIBRARY_NAME\.to_owned\(\)\)\)[\s\S]*?"none"/,
    'The installer records and adds a previously absent Pulvis registration');
assert(rust.includes('const BUNDLED_CORE: &[u8] = include_bytes!("../../../csound/GrainCore.txt");'),
    'Installer embeds the core from the plugin source');
assert(rust.includes('fn system_locale() -> String') && rust.includes('LC_ALL') && rust.includes('LANGUAGE'),
    'The native installer can detect the OS locale when WebKit reports only its fallback language');
assert((await read('installer/ui/app.js')).includes("invoke('system_locale')")
    && (await read('installer/ui/app.js')).includes('languageManuallySelected'),
    'OS auto-detection respects a saved or newly chosen installer language');
assert.match(rust, /\.join\("csound"\)[\s\S]*?\.join\("modules"\)[\s\S]*?\.join\("GrainCore\.txt"\)/,
    'Installer resolves the shared core beside libraries under csound/modules');
assert.match(rust, /fs::write\(&core_path, BUNDLED_CORE\)/, 'Installer writes the shared core to the host resource tree');
assert.match(rust, /remove_if_bundled\(&destination\.join\("modules\/GrainCore\.txt"\), BUNDLED_CORE\)/,
    'Installer cleans its historical misplaced core file');
const uninstallFiles = rust.match(/const INSTALL_FILES:[\s\S]*?= &\[[\s\S]*?\];/m)?.[0] ?? '';
assert(uninstallFiles.includes('MIGRATION_MARKER'), 'Uninstall removes the registration marker so the library directory can be removed');
const bundledFiles = rust.match(/const BUNDLED_FILES:[\s\S]*?= &\[[\s\S]*?\];/m)?.[0] ?? '';
assert(bundledFiles && !bundledFiles.includes('modules/GrainCore.txt'), 'The shared core is not bundled inside the Pulvis library');
assert(bundledFiles.includes('assets/pulvis-icon.png'), 'The README icon is bundled by the desktop installer');
if (!stageMode) assert.match(await read('scripts/install.mjs'), /public\/csound\/modules/,
    'CLI installation and desktop installation both target the shared host core location');

for (const [path, text] of [
    ['README.md', 'Pulvis'], ['README.zh-CN.md', '微粒'], ['README.ru.md', 'Пульвис'],
]) {
    assert((await read(path)).includes(text), `${path} contains the localized library name`);
}
const ui = await read('installer/ui/app.js');
for (const label of ['Pulvis', '微粒', 'Пульвис']) assert(ui.includes(label), `Installer UI contains ${label}`);
const iconCheck = spawnSync(process.execPath, [resolve(root, 'scripts/verify-icons.mjs'), root], { encoding: 'utf8' });
assert.equal(iconCheck.status, 0, `Icon assets pass structural checks: ${iconCheck.stderr || iconCheck.stdout}`);
const windowsInstaller = (await read('installer/windows/pulvis.iss')).replace(/\r\n/g, '\n');
for (const item of ['WizardStyle=modern dynamic polar includetitlebar', 'WizardImageFile=wizard-image.png',
    'WizardSmallImageFile=wizard-small.png', 'WizardImageFileDynamicDark=wizard-image.png',
    'WizardSmallImageFileDynamicDark=wizard-small.png', 'UsePreviousAppDir=yes', 'Flags: dontcopy', 'function PrepareToInstall', 'GetSHA256OfFile',
    '#if TargetArch == "arm64"', '#define AllowedArch "arm64"', '#define AllowedArch "x64os"', 'ArchitecturesAllowed={#AllowedArch}']) {
    assert(windowsInstaller.includes(item), `Native Windows installer preserves ${item}`);
}
for (const item of [
    'DefaultDirName={code:GetDefaultPluginDir}',
    'ShowLanguageDialog=no', 'LanguageDetectionMethod=uilanguage',
]) assert(windowsInstaller.includes(item), `Native Windows installer preserves ${item}`);
for (const item of [
    'UsePreviousAppDir=yes',
    'function DetectDefaultLibrariesDirectory: string',
    'function TryDetectRunningHost: string',
    "GetEnv('CSMODULAR_HOST_ROOT')",
    "GetEnv('CSMODULAR_ROOT')",
    "function TryFindHostInWorkspace(WorkspaceDir: string): string",
    'GetDriveTypeW(DriveRoot) = 3',
    "WizardForm.DirEdit.Text := ''",
    "UpdateRegistration('uninstall', AppDir",
]) assert(windowsInstaller.includes(item), `Native Windows installer supports host discovery and upgrades with ${item}`);
const locationCopy = windowsInstaller.split(/\r?\n/)
    .filter(line => /^(english|chinesesimp|russian)\.SelectDir(Text|Desc)=/.test(line)).join('\n');
assert(locationCopy && !/granular|rename|migrat|shared Csound core|library index/i.test(locationCopy),
    'The location page copy describes only what is installed');
const directoryPageLogic = windowsInstaller.slice(windowsInstaller.indexOf('function NextButtonClick'),
    windowsInstaller.indexOf('function PrepareToInstall'));
assert(directoryPageLogic.includes('WizardForm.DirEdit.Text')
    && !directoryPageLogic.includes("ExpandConstant('{app}')"),
    'The location page validates its edit field before the app directory constant is initialized');
assert(!/DefaultDirName=.*0\.0\.5/i.test(windowsInstaller), 'The plugin install directory is stable across versions');
assert(!windowsInstaller.includes('WebView2'), 'The Windows setup does not install or launch WebView2');
const readmeCheck = spawnSync(process.execPath, [resolve(root, 'scripts/check-readmes.mjs')], { encoding: 'utf8' });
assert.equal(readmeCheck.status, 0, `README links and anchors pass: ${readmeCheck.stderr || readmeCheck.stdout}`);
const archiveRules = await read('.gitattributes');
assert(archiveRules.includes('P*-CROSS-PLATFORM-ACCEPTANCE.md export-ignore')
    && archiveRules.includes('P*-CROSS-PLATFORM-ACCEPTANCE.json export-ignore'),
    'The source archive leaves post-build acceptance records as separate release evidence');
if (!archiveMode) {
    const workflow = await read('.github/workflows/build-installers.yml');
    for (const expectedName of [
        'pulvis-windows-x64-v0.0.5',
        'pulvis-windows-arm64-v0.0.5',
        'pulvis-macos-arm64-v0.0.5',
        'pulvis-macos-x64-v0.0.5',
        'pulvis-linux-x64-v0.0.5',
        'pulvis-source-v0.0.5',
    ]) {
        assert(workflow.includes(expectedName), `CI publishes ${expectedName}`);
    }
    assert(workflow.includes('innosetup-7.1.1-x64.exe'), 'Windows CI pins the native installer compiler');
    assert(workflow.includes('node scripts/build-windows-installer.mjs --arch=x64')
        && workflow.includes('node scripts/build-windows-installer.mjs --arch=arm64'),
        'Windows CI builds separate x64 and ARM64 installers');
    assert(workflow.includes('node scripts/build-macos-pkg.mjs --arch=arm64')
        && workflow.includes('node scripts/build-macos-pkg.mjs --arch=x64')
        && (await read('scripts/build-macos-pkg.mjs')).includes('Pulvis-${version}-macos-${arch}.pkg'),
        'macOS CI builds and verifies separate native Apple Silicon (arm64) and Intel (x64) .pkg installers');
    assert(workflow.includes('node scripts/build-linux-deb.mjs')
        && workflow.includes('Build, verify and stage Debian package plus SHA-256')
        && (await read('scripts/build-linux-deb.mjs')).includes('Pulvis-${version}-linux-x64.deb'),
        'Linux CI builds and verifies the native Debian package and its checksum');
    assert(!workflow.toLowerCase().includes('webkit') && !workflow.toLowerCase().includes('webview'),
        'CI desktop installers do not require WebKit or WebView');
    assert(workflow.includes('PULVIS_TASK_ROOT') && workflow.includes('cleanup-build-task.mjs')
        && workflow.includes('Upload Windows x64 build diagnostics') && workflow.includes('Upload Windows ARM64 build diagnostics')
        && workflow.includes('Upload Linux build diagnostics')
        && workflow.includes('Upload macOS Apple Silicon build diagnostics') && workflow.includes('Upload macOS Intel build diagnostics'),
        'CI keeps per-run work until upload, exports failure diagnostics and cleans only the task directory');
    assert(!workflow.toLowerCase().includes('appimage'),
        'CI does not create an AppImage package');
    for (const stale of ['CsModular-Granular', '1.1.1']) assert(!workflow.includes(stale), `CI does not retain stale release name ${stale}`);
}

const coreAndWrappers = [await read('csound/GrainCore.txt'), ...await Promise.all(
    ['GrainFreeze', 'GrainSample', 'GrainOsc'].map(name => read(`modules/${name}.txt`)))].join('\n');
assert(!/\b(partikkel|partikkelsync|grain|grain2|grain3|syncgrain|granule|diskgrain|fof|fof2|fog|sndwarp|sndwarpst|mincer|temposcal)\b/i
    .test(coreAndWrappers.replace(/;.*/g, '')), 'No prohibited built-in granular opcode is used');

const cargo = spawnSync('cargo', ['--version'], { encoding: 'utf8', windowsHide: true });
const nativeBuild = cargo.status === 0 ? 'available, not run by source smoke' : 'unavailable on PATH; no native build performed by source smoke';
const report = {
    version,
    candidateRoot: root,
    nativeBuild,
    files: Object.fromEntries(Object.entries(hashes).map(([path, sha256]) => [relative(root, resolve(root, path)).replaceAll('\\', '/'), sha256])),
};
const reportPath = resolve(reportArgument || resolve(root, 'test-results', archiveMode
    ? 'desktop-package-smoke-archive.json'
    : (stageMode ? 'desktop-package-smoke-stage.json' : 'desktop-package-smoke.json')));
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath,
    JSON.stringify(report, null, 2) + '\n');
const label = archiveMode ? 'Extracted source archive' : (stageMode ? 'Staged release' : 'Desktop package source');
console.log(`${label} smoke passed for ${version}; native build ${nativeBuild}.`);
