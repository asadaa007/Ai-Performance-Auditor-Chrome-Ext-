import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicIconsDir = join(__dirname, '..', 'public', 'icons');

const requiredIcons = ['icon-16.png', 'icon-32.png', 'icon-48.png', 'icon-128.png'];
const hasCustomIcons = requiredIcons.every((name) => existsSync(join(publicIconsDir, name)));

if (hasCustomIcons) {
  console.log('Using custom icons from public/icons/');
  process.exit(0);
}

console.log('No custom icons in public/icons/ — generating placeholder icons.');
console.log('Replace them with your PNGs named: icon-16.png, icon-32.png, icon-48.png, icon-128.png');

function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createSolidPng(size, r, g, b) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const row = Buffer.alloc(1 + size * 3);
  row[0] = 0;
  for (let x = 0; x < size; x++) {
    const offset = 1 + x * 3;
    row[offset] = r;
    row[offset + 1] = g;
    row[offset + 2] = b;
  }

  const raw = Buffer.alloc(row.length * size);
  for (let y = 0; y < size; y++) {
    row.copy(raw, y * row.length);
  }

  const idat = deflateSync(raw);
  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', idat),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(publicIconsDir, { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const png = createSolidPng(size, 99, 102, 241);
  writeFileSync(join(publicIconsDir, `icon-${size}.png`), png);
}

console.log('Placeholder icons written to public/icons/');
