// Generates the 1024x1024 source icon (src-tauri/app-icon.png) without external tools.
// Platform icon sets are derived from it with `pnpm tauri icon src-tauri/app-icon.png`.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const SIZE = 1024;
const RADIUS = 200;
/** @typedef {[number, number, number]} Rgb */

/** @type {Rgb} */
const BOARD = [31, 95, 74];
/** @type {Rgb} */
const FRAME = [222, 184, 135];
/** @type {Rgb} */
const CHALK = [245, 245, 240];

/**
 * @param {number} x
 * @param {number} y
 * @param {number} inset
 * @param {number} radius
 */
function insideRoundedSquare(x, y, inset, radius) {
  const min = inset;
  const max = SIZE - 1 - inset;
  if (x < min || x > max || y < min || y > max) return false;
  const cx = Math.min(Math.max(x, min + radius), max - radius);
  const cy = Math.min(Math.max(y, min + radius), max - radius);
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
}

/**
 * Whether the point lies on the chalk stroke (a sine-like wave across the board).
 * @param {number} x
 * @param {number} y
 */
function onStroke(x, y) {
  if (x < 250 || x > 774) return false;
  const t = (x - 250) / 524;
  const curve = 560 - Math.sin(t * Math.PI * 2) * 110;
  return Math.abs(y - curve) < 34;
}

const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
for (let y = 0; y < SIZE; y++) {
  const row = y * (SIZE * 4 + 1);
  raw[row] = 0;
  for (let x = 0; x < SIZE; x++) {
    /** @type {Rgb | null} */
    let color = null;
    if (insideRoundedSquare(x, y, 40, RADIUS)) color = FRAME;
    if (insideRoundedSquare(x, y, 110, RADIUS - 70)) color = onStroke(x, y) ? CHALK : BOARD;
    const offset = row + 1 + x * 4;
    if (color) {
      raw[offset] = color[0];
      raw[offset + 1] = color[1];
      raw[offset + 2] = color[2];
      raw[offset + 3] = 255;
    }
  }
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

/** @param {Buffer} buffer */
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer)
    crc = /** @type {number} */ (CRC_TABLE[(crc ^ byte) & 0xff]) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * @param {string} type
 * @param {Buffer} data
 */
function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(SIZE, 0);
header.writeUInt32BE(SIZE, 4);
header[8] = 8; // bit depth
header[9] = 6; // RGBA

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', header),
  chunk('IDAT', deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);

writeFileSync(new URL('../src-tauri/app-icon.png', import.meta.url), png);
