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

function extractTextFromPdfBuffer(buffer) {
  const binaryString = buffer.toString('latin1');
  let extractedChunks = [];

  // Match all stream objects: stream ... endstream
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  while ((match = streamRegex.exec(binaryString)) !== null) {
    const rawStream = match[1];
    // Check preceding dictionary to see if FlateDecode or ASCII85Decode is used
    const preHeader = binaryString.slice(Math.max(0, match.index - 300), match.index);
    let streamBytes = Buffer.from(rawStream, 'binary');

    if (/ASCII85Decode/i.test(preHeader)) {
      streamBytes = decodeAscii85(rawStream);
    }

    if (/FlateDecode/i.test(preHeader)) {
      try {
        streamBytes = zlib.inflateSync(streamBytes);
      } catch (err) {
        // Try raw inflate
        try {
          streamBytes = zlib.inflateRawSync(streamBytes);
        } catch {}
      }
    }

    const decodedStr = streamBytes.toString('latin1');

    // Extract text from standard PDF text operators: (text) Tj or [(t1) 10 (t2)] TJ
    const tjRegex = /\(([^()]{1,})\)\s*(?:Tj|'|")/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(decodedStr)) !== null) {
      extractedChunks.push(tjMatch[1]);
    }

    const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
    let arrMatch;
    while ((arrMatch = arrayTjRegex.exec(decodedStr)) !== null) {
      const innerTjRegex = /\(([^()]+)\)/g;
      let innerMatch;
      while ((innerMatch = innerTjRegex.exec(arrMatch[1])) !== null) {
        extractedChunks.push(innerMatch[1]);
      }
    }
  }

  return extractedChunks
    .map(s => s.replace(/\\([()\\])/g, '$1').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log("PDF parser tester written.");
