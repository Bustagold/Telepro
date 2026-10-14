import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b, a) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(len + 12);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);

    // CRC
    let crc = 0xffffffff;
    for (let i = 4; i < len + 8; i++) {
      let c = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ c) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        c >>>= 1;
      }
    }
    buf.writeUInt32BE((crc ^ 0xffffffff) >>> 0, len + 8);
    return buf;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, offset++); // filter byte
    for (let x = 0; x < width; x++) {
      // TelePro blue gradient logic
      const grad = Math.floor((y / height) * 40);
      rawData.writeUInt8(Math.max(0, r - grad), offset++);
      rawData.writeUInt8(Math.max(0, g - grad), offset++);
      rawData.writeUInt8(Math.min(255, b + grad), offset++);
      rawData.writeUInt8(a, offset++);
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write icons (Telegram blue: #2481cc = RGB 36, 129, 204)
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 36, 129, 204, 255));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 36, 129, 204, 255));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 36, 129, 204, 255));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 36, 129, 204, 255));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, 36, 129, 204, 255));

console.log('Generated PWA PNG and ICO icons successfully.');
