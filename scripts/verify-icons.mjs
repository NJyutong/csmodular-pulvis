import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(process.argv[2] || scriptRoot);
const read = path => readFile(resolve(root, path));
let sourceBytes = 0;
if (existsSync(resolve(root, 'assets/pulvis-source.webp'))) {
    const source = await read('assets/pulvis-source.webp');
    assert.equal(source.toString('ascii', 0, 4), 'RIFF', 'User supplied source must be WebP');
    assert.equal(source.toString('ascii', 8, 12), 'WEBP', 'User supplied source must be WebP');
    sourceBytes = source.length;
}

const sourcePng = await read('assets/pulvis-icon.png');
assert.equal(sourcePng.toString('hex', 0, 8), '89504e470d0a1a0a', 'README icon must be PNG');
assert.equal(sourcePng.readUInt32BE(16), 512, 'README icon width');
assert.equal(sourcePng.readUInt32BE(20), 512, 'README icon height');
for (const path of ['installer/ui/pulvis-icon.png', 'installer/src-tauri/icons/icon.png']) {
    assert.deepEqual(await read(path), sourcePng, `${path} must match the README and product icon`);
}

const ico = await read('installer/src-tauri/icons/icon.ico');
assert.equal(ico.readUInt16LE(0), 0, 'ICO reserved field');
assert.equal(ico.readUInt16LE(2), 1, 'ICO image type');
const frameCount = ico.readUInt16LE(4);
assert(frameCount >= 7, 'Windows icon must include multiple standard resolutions');
const sizes = new Set(Array.from({ length: frameCount }, (_, index) => {
    const size = ico[6 + index * 16];
    return size === 0 ? 256 : size;
}));
for (const size of [16, 24, 32, 48, 64, 128, 256]) assert(sizes.has(size), `ICO is missing ${size}px`);

const icns = await read('installer/src-tauri/icons/icon.icns');
assert.equal(icns.toString('ascii', 0, 4), 'icns', 'macOS icon container signature');
assert.equal(icns.readUInt32BE(4), icns.length, 'macOS icon container length');
assert(icns.includes(Buffer.from('ic09')), 'macOS icon must include the 512px PNG representation');

const wizardImage = await read('installer/windows/wizard-image.png');
assert.equal(wizardImage.toString('hex', 0, 8), '89504e470d0a1a0a', 'Inno Setup wizard image must be PNG');
assert.equal(wizardImage.readUInt32BE(16), 492, 'Wizard artwork width follows the 164:314 ratio at 3x');
assert.equal(wizardImage.readUInt32BE(20), 942, 'Wizard artwork height follows the 164:314 ratio at 3x');
const wizardSmall = await read('installer/windows/wizard-small.png');
assert.equal(wizardSmall.toString('hex', 0, 8), '89504e470d0a1a0a', 'Wizard corner icon must be PNG');
assert.equal(wizardSmall.readUInt32BE(16), 256, 'Wizard corner icon width');
assert.equal(wizardSmall.readUInt32BE(20), 256, 'Wizard corner icon height');

console.log(`Icon assets validated: WebP source ${sourceBytes} bytes, PNG ${sourcePng.length} bytes, ICO ${frameCount} sizes.`);
