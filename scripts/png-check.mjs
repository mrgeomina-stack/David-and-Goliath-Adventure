import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
const table = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
export function inspectPng(file) {
  const b = readFileSync(file);
  let width = 0,
    height = 0;
  try {
    if (b.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a")
      throw Error("Not a PNG");
    let offset = 8,
      ended = false,
      depth = 0,
      color = 0,
      interlace = 0;
    const data = [];
    while (offset < b.length) {
      if (offset + 12 > b.length) throw Error("Incomplete PNG chunk");
      const length = b.readUInt32BE(offset),
        end = offset + 12 + length;
      if (end > b.length)
        throw Error(
          "Incomplete " +
            b.toString("ascii", offset + 4, offset + 8) +
            " chunk",
        );
      const type = b.toString("ascii", offset + 4, offset + 8);
      let crc = 0xffffffff;
      for (let i = offset + 4; i < end - 4; i++)
        crc = table[(crc ^ b[i]) & 255] ^ (crc >>> 8);
      if ((crc ^ 0xffffffff) >>> 0 !== b.readUInt32BE(end - 4))
        throw Error("Invalid " + type + " checksum");
      if (type === "IHDR") {
        width = b.readUInt32BE(offset + 8);
        height = b.readUInt32BE(offset + 12);
        depth = b[offset + 16];
        color = b[offset + 17];
        interlace = b[offset + 20];
      }
      if (type === "IDAT") data.push(b.subarray(offset + 8, end - 4));
      if (type === "IEND") {
        ended = true;
        break;
      }
      offset = end;
    }
    if (!ended) throw Error("Missing IEND");
    const pixels = inflateSync(Buffer.concat(data));
    if (depth === 8 && interlace === 0 && (color === 2 || color === 6)) {
      const expected = (width * (color === 6 ? 4 : 3) + 1) * height;
      if (pixels.length !== expected) throw Error("Incomplete pixel rows");
    }
    return { valid: true, width, height };
  } catch (e) {
    return { valid: false, width, height, error: e.message };
  }
}
