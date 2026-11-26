/**
 * A minimal RGBA PNG encoder for the tiny pattern sheets of the Phosphor sprite. It uses stored
 * (uncompressed) deflate blocks, so it needs no zlib and runs anywhere: browser, worker or test.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

/** A zlib stream of stored deflate blocks (at most 65535 bytes each). */
function zlibStored(data: Uint8Array): Uint8Array {
  const blockCount = Math.max(1, Math.ceil(data.length / 65535));
  const out = new Uint8Array(2 + data.length + blockCount * 5 + 4);
  const view = new DataView(out.buffer);
  out[0] = 0x78;
  out[1] = 0x01;
  let at = 2;
  for (let i = 0; i < blockCount; i++) {
    const block = data.subarray(i * 65535, (i + 1) * 65535);
    out[at] = i === blockCount - 1 ? 1 : 0;
    view.setUint16(at + 1, block.length, true);
    view.setUint16(at + 3, ~block.length & 0xffff, true);
    out.set(block, at + 5);
    at += 5 + block.length;
  }
  view.setUint32(at, adler32(data));
  return out;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

/** Encodes `width × height` RGBA pixels (row-major, 4 bytes each) as a PNG file. */
export function encodePng(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  header.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA, no interlace
  const stride = width * 4;
  const raw = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }
  const parts = [
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", zlibStored(raw)),
    chunk("IEND", new Uint8Array()),
  ];
  const png = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    png.set(part, at);
    at += part.length;
  }
  return png;
}
