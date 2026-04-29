// Generates assets/logo.png — 216×216 RGBA PNG for AppSource large logo
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

const W = 216, H = 216;
const buf = Buffer.alloc(W * H * 4, 0);

function px(x, y, r, g, b, a = 255) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  buf[i] = r; buf[i+1] = g; buf[i+2] = b; buf[i+3] = a;
}

function rect(x, y, w, h, r, g, b, a = 255) {
  x = Math.round(x); y = Math.round(y);
  w = Math.round(w); h = Math.round(h);
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      px(x+dx, y+dy, r, g, b, a);
}

// ── Background gradient (dark navy top → slightly lighter bottom) ──────────
for (let y = 0; y < H; y++) {
  const t = y / H;
  for (let x = 0; x < W; x++)
    px(x, y, Math.round(12+t*12), Math.round(20+t*18), Math.round(38+t*26));
}

// ── Chart geometry ────────────────────────────────────────────────────────
const L = 34, R = 182, T = 22, B = 184;
const zeroY = 152;

// Subtle dashed gridlines above zero
for (let row = 1; row <= 3; row++) {
  const gy = Math.round(T + row * (zeroY - T) / 4);
  for (let x = L + 2; x <= R - 2; x += 4) px(x, gy, 45, 60, 90);
}

// Left axis  (blue-ish)
rect(L,   T, 2, B - T, 70, 105, 180);
// Right axis (orange-ish)
rect(R,   T, 2, B - T, 180, 110, 50);
// Zero baseline (light blue-grey)
rect(L, zeroY, R - L + 2, 2, 85, 108, 148);

// ── Bar groups ────────────────────────────────────────────────────────────
// barW=17  barGap=5  grpW=39  spacing=~9
const barW = 17, barGap = 5, grpW = barW*2 + barGap;
const sp   = (R - L - 3 * grpW) / 4;  // ≈ 8.75

const groups = [
  // [primaryH, secondaryH]  positive = above zero, negative = below zero (red)
  [108, 68],
  [58,  122],
  [42,  -34],   // secondary goes negative → red
];

groups.forEach(([lh, rh], i) => {
  const gx = L + sp + i * (grpW + sp);
  const bx = gx + barW + barGap;

  // Primary bar — blue #2563eb
  if (lh >= 0) {
    rect(gx, zeroY - lh, barW, lh, 37, 99, 235);
    rect(gx + 2, zeroY - lh, barW - 4, 4, 90, 150, 255);   // top highlight
  } else {
    rect(gx, zeroY, barW, -lh, 220, 38, 38);
    rect(gx + 2, zeroY + (-lh) - 4, barW - 4, 4, 255, 90, 90);
  }

  // Secondary bar — orange #f97316
  if (rh >= 0) {
    rect(bx, zeroY - rh, barW, rh, 249, 115, 22);
    rect(bx + 2, zeroY - rh, barW - 4, 4, 255, 175, 90);   // top highlight
  } else {
    rect(bx, zeroY, barW, -rh, 220, 38, 38);
    rect(bx + 2, zeroY + (-rh) - 4, barW - 4, 4, 255, 90, 90);
  }
});

// ── Legend ────────────────────────────────────────────────────────────────
const lgY = B + 12;
const cx  = Math.round((L + R) / 2);
rect(cx - 22, lgY, 12, 12, 37, 99, 235);    // blue square
rect(cx + 10, lgY, 12, 12, 249, 115, 22);   // orange square

// ── Axis tick marks ───────────────────────────────────────────────────────
for (let row = 1; row <= 4; row++) {
  const ty = Math.round(T + row * (zeroY - T) / 4);
  rect(L - 4, ty, 4, 1, 70, 105, 180);
  rect(R + 2,  ty, 4, 1, 180, 110, 50);
}

// ── Build PNG ─────────────────────────────────────────────────────────────
// Scanlines: filter byte 0 + raw RGBA row
const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  const off = y * (1 + W * 4);
  raw[off] = 0;
  buf.copy(raw, off + 1, y * W * 4, (y+1) * W * 4);
}
const compressed = zlib.deflateSync(raw, { level: 9 });

// CRC32 helper
function crc32(data) {
  let c = 0xffffffff;
  for (const b of data) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0); }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const tBuf = Buffer.from(type, 'ascii');
  const lenB = Buffer.alloc(4); lenB.writeUInt32BE(data.length);
  const crcB = Buffer.alloc(4); crcB.writeUInt32BE(crc32(Buffer.concat([tBuf, data])));
  return Buffer.concat([lenB, tBuf, data, crcB]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;

const png = Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', compressed),
  chunk('IEND', Buffer.alloc(0)),
]);

const outPath = path.join(__dirname, 'assets', 'logo.png');
fs.mkdirSync(path.join(__dirname, 'assets'), { recursive: true });
fs.writeFileSync(outPath, png);
console.log('Written:', outPath, `(${png.length} bytes)`);
