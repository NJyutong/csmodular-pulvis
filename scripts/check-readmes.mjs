import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
const requireReleaseAssets = process.argv.includes('--require-release-assets');
const files = ['README.md', 'README.zh-CN.md', 'README.ru.md'];
const releaseBase = `https://github.com/NJyutong/csmodular-pulvis/releases/download/v${version}/`;
const releaseNames = [
    `Pulvis-${version}-windows-x64.exe`,
    `Pulvis-${version}-windows-arm64.exe`,
    `Pulvis-${version}-macos-arm64.pkg`,
    `Pulvis-${version}-macos-x64.pkg`,
    `Pulvis-${version}-linux-x64.deb`,
    `Pulvis-${version}-source.zip`,
    'SHA256SUMS.txt',
];
const releaseUrls = new Set(releaseNames.map(name => `${releaseBase}${name}`));
const localizedNames = ['Pulvis', '微粒', 'Пульвис'];
const featureLines = [
    ['Grain Freeze', 'Grain Sample', 'Grain Osc'],
    ['颗粒冻结', '颗粒采样', '颗粒振荡器'],
    ['Гранулярная заморозка', 'Гранулярный сэмпл', 'Гранулярный осциллятор'],
];
const sha256 = contents => createHash('sha256').update(contents).digest('hex');
const anchorSlug = heading => heading.trim().toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');

for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const markdown = readFileSync(resolve(root, file), 'utf8');
    const nav = markdown.split(/\r?\n/).find(line => line.includes(' · ') && line.includes('README'));
    const languageNames = ['English', '简体中文', 'Русский'];
    const expectedNav = files.map((other, i) => other === file
        ? `**${languageNames[i]}**` : `[${languageNames[i]}](${other})`).join(' · ');
    assert.equal(nav, expectedNav, `${file} links only to the other language editions`);
    const localizedName = localizedNames[index];
    assert(markdown.includes(localizedName), `${file} starts with its localized Pulvis name`);
    for (const name of releaseNames.filter(name => !name.endsWith('-source.zip'))) {
        assert(markdown.includes(releaseBase + name), `${file} links to ${name}`);
    }
    const language = ['en', 'zh-CN', 'ru'][index];
    const header = `assets/pulvis-header-${language}.png`;
    assert.equal(markdown.match(/<img src="([^"]+)"/)?.[1], header, `${file} opens with its own localized artwork`);
    const png = readFileSync(resolve(root, header));
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1280, 640]);
    assert(markdown.includes(version), `${file} identifies version ${version}`);
    for (const feature of featureLines[index]) assert(markdown.includes(feature), `${file} introduces ${feature}`);

    const anchors = new Set([...markdown.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => anchorSlug(match[1])));
    for (const match of markdown.matchAll(/!??\[[^\]]*\]\(([^)]+)\)/g)) {
        const href = match[1].trim().split(/\s+/, 1)[0].replace(/^<|>$/g, '');
        if (/^(?:https?:|mailto:)/i.test(href)) {
            if (href.includes('/releases/download/')) assert(releaseUrls.has(href), `${file} uses a known Pulvis release asset URL`);
            continue;
        }
        const [target, fragment] = href.split('#', 2);
        if (fragment) assert(anchors.has(decodeURIComponent(fragment)), `${file} has heading anchor #${fragment}`);
        if (!target) continue;
        const targetPath = resolve(root, dirname(file), decodeURIComponent(target));
        assert(targetPath === root || targetPath.startsWith(root + sep), `${file} link stays inside the repository`);
        assert(existsSync(targetPath), `${file} local link exists: ${target}`);
    }
}

if (requireReleaseAssets) {
    const releaseDirectory = resolve(root, 'release-assets', version);
    const packageNames = releaseNames.slice(0, -1);
    const expectedRows = [];
    for (const name of packageNames) {
        const packagePath = resolve(releaseDirectory, name);
        assert(existsSync(packagePath), `Release package exists: ${packagePath}`);
        const bytes = readFileSync(packagePath);
        const hash = sha256(bytes);
        const sidecarPath = `${packagePath}.sha256`;
        assert(existsSync(sidecarPath), `Release SHA-256 sidecar exists: ${sidecarPath}`);
        assert.equal(readFileSync(sidecarPath, 'utf8'), `${hash}  ${name}\n`, `Sidecar hash matches ${name}`);
        expectedRows.push(`${hash}  ${name}`);
    }
    const manifestPath = resolve(releaseDirectory, 'SHA256SUMS.txt');
    assert(existsSync(manifestPath), `Release checksum manifest exists: ${manifestPath}`);
    assert.equal(readFileSync(manifestPath, 'utf8'), `${expectedRows.join('\n')}\n`,
        'SHA256SUMS.txt matches all three downloadable packages');
}
const socialPreview = readFileSync(resolve(root, 'assets/pulvis-social-preview.png'));
assert.equal(socialPreview.toString('hex', 0, 8), '89504e470d0a1a0a', 'GitHub social preview is a PNG');
assert.deepEqual([socialPreview.readUInt32BE(16), socialPreview.readUInt32BE(20)], [1280, 640],
    'GitHub social preview is 1280 × 640 pixels');
assert(socialPreview.length < 1024 * 1024, 'GitHub social preview is below 1 MiB');
console.log(`README links and anchors checked in ${files.length} languages${requireReleaseAssets ? ' including release files' : ''}.`);
