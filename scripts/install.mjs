// Install into a compatible source checkout. Publish the host registration last.
import { lstat, mkdir, mkdtemp, readFile, rename, rm, rmdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const host = resolve(process.argv[2] || process.env.CSMODULAR_HOST_ROOT || resolve(root, '../csmodular-main'));
const patch = resolve(root, 'integration/csmodular.patch');
const compatibilityUpdate = resolve(root, 'integration/wav-session-compat.patch');
const git = (args, file = patch) => execFileSync('git', ['-c', `safe.directory=${host.replaceAll('\\', '/')}`, 'apply', ...args, file], { cwd: host, stdio: 'pipe' });
async function stat(path) {
    try { return await lstat(path); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
}
async function directory(path) {
    const info = await stat(path);
    if (info && !info.isDirectory()) throw new Error(`Expected a directory: ${path}`);
    return !!info;
}

const libraries = join(host, 'public/libraries');
const target = join(libraries, 'pulvis');
const legacy = join(libraries, 'granular');
const lock = join(host, '.pulvis-install-lock');
await mkdir(lock);
let staging;
const applied = [];
const studioUpdate = resolve(root, 'integration/studio-upgrade.patch');
const liveUpdates = ['display-menu.patch', 'studio-release-update.patch', 'studio-live-update.patch', 'studio-display-update.patch']
    .map(name => resolve(root, 'integration', name));
const renderer = '--include=src/ui/PulvisPanel.js';
function matches(file, flags = []) {
    try { git([...flags, '--check'], file); return true; }
    catch { return false; }
}
function apply(file, flags = []) {
    git(flags, file);
    applied.push({ file, flags });
}
let migrated = false;
const undo = [];
const created = [];
let preserveBackup = false;
try {
    const syncAssets = process.argv.includes('--sync-assets');
    // A locally maintained host may have its own menus and patch loader. Verify
    // the full audio/display integration before refreshing only its public assets.
    const audioDisplay = [renderer, '--include=src/csound/*', '--include=src/ModuleFactory.js'];
    if (syncAssets && (!matches(patch, ['--reverse', ...audioDisplay])
        || !matches(resolve(root, 'integration/display-menu.patch'), ['--reverse', '--include=src/ui/ModuleContextMenu.js']))) {
        throw new Error('The local host audio and display code must be integrated before syncing assets.');
    }
    const alreadyInstalled = syncAssets || matches(patch, ['--reverse']);
    const studioMigration = !alreadyInstalled && liveUpdates.find(file => matches(file));
    if (!alreadyInstalled && !matches(patch) && !studioMigration && !matches(studioUpdate) && !matches(compatibilityUpdate)) {
        throw new Error('Host integration does not match this checkout. Review integration/csmodular.patch.');
    }
    await directory(join(host, 'public'));
    await directory(libraries);
    const indexPath = join(libraries, '_index.json');
    const index = JSON.parse(await readFile(indexPath, 'utf8'));
    if (!Array.isArray(index.libraries)) throw new Error('Host library index has no libraries array.');
    const hasTarget = await directory(target);
    const hasLegacy = await directory(legacy);
    const migrate = !hasTarget && hasLegacy;
    if (!hasTarget || !hasLegacy) index.libraries = index.libraries.map(name => name === 'granular' ? 'pulvis' : name);
    index.libraries = index.libraries.filter((name, i, all) => name !== 'pulvis' || all.indexOf(name) === i);
    if (!index.libraries.includes('pulvis')) index.libraries.push('pulvis');

    const files = new Map();
    const modules = JSON.parse(await readFile(join(root, '_index.json'), 'utf8'));
    const ids = new Set(modules.modules.map(item => item.name));
    for (const id of ids) for (const ext of ['js', 'txt']) {
        const path = `modules/${id}.${ext}`;
        files.set(join(target, path), await readFile(join(root, path)));
    }
    const oldIndex = join(migrate ? legacy : target, '_index.json');
    let merged = modules;
    if (await stat(oldIndex)) {
        merged = JSON.parse(await readFile(oldIndex, 'utf8'));
        if (!Array.isArray(merged.modules)) throw new Error('Invalid module index.');
        merged.modules = [...merged.modules.filter(m => !ids.has(typeof m === 'string' ? m : m?.name)), ...modules.modules];
    }
    files.set(join(target, '_index.json'), JSON.stringify(merged, null, 2) + '\n');
    for (const path of ['_meta.json', 'README.md', 'README.zh-CN.md', 'README.ru.md', 'SOURCES.md', 'LICENSE', 'assets/pulvis-icon.png', 'assets/pulvis-header-en.png', 'assets/pulvis-social-preview.png', 'assets/pulvis-header-zh-CN.png', 'assets/pulvis-header-ru.png']) {
        files.set(join(target, path), await readFile(join(root, path)));
    }
    files.set(join(host, 'public/csound/modules/GrainCore.txt'), await readFile(join(root, 'csound/GrainCore.txt')));
    files.set(join(host, 'public/patches/pulvis-demo.json'), await readFile(join(root, 'examples/pulvis-demo.json')));
    files.set(indexPath, JSON.stringify(index, null, 2) + '\n');
    staging = await mkdtemp(join(host, '.pulvis-stage-'));
    let n = 0;
    for (const contents of files.values()) await writeFile(join(staging, String(n++)), contents);
    if (!alreadyInstalled) {
        if (matches(patch)) {
            apply(patch);
        } else if (studioMigration) {
            apply(studioMigration);
        } else {
            // Upgrades keep unrelated host edits. Verify the whole integration before publishing.
            if (matches(compatibilityUpdate)) apply(compatibilityUpdate);
            if (!matches(studioUpdate) || !matches(patch, [renderer])) {
                throw new Error('Host integration does not match this checkout. Review integration/csmodular.patch.');
            }
            apply(studioUpdate);
            apply(patch, [renderer]);
        }
        git(['--reverse', '--check']);
    }
    if (migrate) { await rename(legacy, target); migrated = true; }
    async function ensureDir(path) {
        if (path === host) return;
        await ensureDir(dirname(path));
        if (!await directory(path)) { await mkdir(path); created.push(path); }
    }
    n = 0;
    for (const path of files.keys()) {
        await ensureDir(dirname(path));
        const existing = await stat(path);
        if (existing && !existing.isFile()) throw new Error(`Expected a regular file: ${path}`);
        const backup = existing && join(staging, `old-${n}`);
        if (backup) await rename(path, backup);
        const entry = { path, backup, installed: false };
        undo.push(entry);
        await rename(join(staging, String(n++)), path);
        entry.installed = true;
    }
    console.log(applied.length ? 'Applied host integration.' : 'Host integration is already installed.');
    console.log(`Installed Pulvis in ${target}`);
} catch (error) {
    try {
        for (const {path, backup, installed} of undo.reverse()) {
            if (installed) await rm(path);
            if (backup) await rename(backup, path);
        }
        for (const path of created.reverse()) await rmdir(path);
        if (migrated) await rename(target, legacy);
        for (const { file, flags } of applied.reverse()) git(['--reverse', ...flags], file);
    } catch (recovery) {
        preserveBackup = true;
        throw new AggregateError([error, recovery], `Install rollback failed. Backups: ${staging}`);
    }
    throw error;
} finally {
    if (staging && !preserveBackup) await rm(staging, { recursive: true, force: true });
    await rmdir(lock);
}
