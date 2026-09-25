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
    if (c === 122 && count === 0) { // 'z'
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

export function extractTextFromPdfRaw(rawPdf) {
  let extractedTextParts = [];

  // Match all stream ... endstream
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamRegex.exec(rawPdf)) !== null) {
    const rawStream = match[1];
    const preHeader = rawPdf.slice(Math.max(0, match.index - 300), match.index);
    let streamBytes = Buffer.from(rawStream, 'binary');

    if (/ASCII85Decode/i.test(preHeader)) {
      streamBytes = decodeAscii85(rawStream);
    }

    if (/FlateDecode/i.test(preHeader)) {
      try {
        streamBytes = zlib.inflateSync(streamBytes);
      } catch (err) {
        try {
          streamBytes = zlib.inflateRawSync(streamBytes);
        } catch {}
      }
    }

    const decodedStr = streamBytes.toString('latin1');

    // Extract PDF strings: (string) Tj or ' or "
    const tjRegex = /\(([^()]{1,})\)\s*(?:Tj|'|")/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(decodedStr)) !== null) {
      extractedTextParts.push(tjMatch[1]);
    }

    // Extract PDF arrays: [(str1) 12 (str2)] TJ
    const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
    let arrMatch;
    while ((arrMatch = arrayTjRegex.exec(decodedStr)) !== null) {
      const innerTjRegex = /\(([^()]+)\)/g;
      let innerMatch;
      while ((innerMatch = innerTjRegex.exec(arrMatch[1])) !== null) {
        extractedTextParts.push(innerMatch[1]);
      }
    }
  }

  // Also check uncompressed text operators
  const plainTjRegex = /\(([^()]{2,})\)\s*(?:Tj|TJ)/g;
  let pMatch;
  while ((pMatch = plainTjRegex.exec(rawPdf)) !== null) {
    if (!extractedTextParts.includes(pMatch[1])) {
      extractedTextParts.push(pMatch[1]);
    }
  }

  return extractedTextParts
    .map(s => s.replace(/\\([()\\])/g, '$1').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log("PDF parser module ready.");
