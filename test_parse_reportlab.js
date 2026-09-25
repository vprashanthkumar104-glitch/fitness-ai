import fs from "fs";
import zlib from "zlib";

function decodeAscii85(str) {
  let cleaned = str.replace(/\s+/g, "");
  if (cleaned.startsWith("<~")) cleaned = cleaned.slice(2);
  if (cleaned.endsWith("~>")) cleaned = cleaned.slice(0, -2);
  
  let out = [];
  let tuple = 0;
  let count = 0;
  
  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned.charCodeAt(i);
    if (c === 122 && count === 0) { // 'z' represents 4 zero bytes
      out.push(0, 0, 0, 0);
      continue;
    }
    if (c >= 33 && c <= 117) {
      tuple = tuple * 85 + (c - 33);
      count++;
      if (count === 5) {
        out.push((tuple >> 24) & 255);
        out.push((tuple >> 16) & 255);
        out.push((tuple >> 8) & 255);
        out.push(tuple & 255);
        tuple = 0;
        count = 0;
      }
    }
  }
  if (count > 1) {
    for (let i = count; i < 5; i++) {
      tuple = tuple * 85 + 84;
    }
    for (let i = 0; i < count - 1; i++) {
      out.push((tuple >> (24 - i * 8)) & 255);
    }
  }
  return Buffer.from(out);
}

// In ReportLab PDF, each page object references a Contents stream:
// e.g. "4 0 obj ... Contents 17 0 R ... endobj"
// "17 0 obj Filter ASCII85Decode FlateDecode Length 2600 stream ... endstream"
console.log("Ascii85 decode logic ready.");
