// Browser & Node compatible pure TypeScript PDF stream and text extractor
// Decodes Flate (deflate / zlib) and ASCII85 streams, handling ReportLab & standard PDF formats

/**
 * Decode ASCII85 / btoa stream
 */
function decodeAscii85(str: string): Uint8Array {
  let cleaned = str.replace(/\s+/g, '');
  if (cleaned.startsWith('<~')) cleaned = cleaned.slice(2);
  if (cleaned.endsWith('~>')) cleaned = cleaned.slice(0, -2);

  const out: number[] = [];
  let tuple = 0;
  let count = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned.charCodeAt(i);
    if (c === 122 && count === 0) {
      // 'z' represents 4 zero bytes
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

  return new Uint8Array(out);
}

/**
 * Decompress deflate / zlib stream in browser (DecompressionStream) or fallback
 */
async function decompressFlate(data: Uint8Array): Promise<Uint8Array> {
  // Check if browser supports DecompressionStream
  if (typeof DecompressionStream !== 'undefined') {
    // Try raw deflate
    try {
      const ds = new DecompressionStream('deflate');
      const writer = ds.writable.getWriter();
      await writer.write(data as any);
      await writer.close();
      const response = new Response(ds.readable);
      const buf = await response.arrayBuffer();
      return new Uint8Array(buf);
    } catch {
      // If zlib format with 2-byte header, try stripping 2 header bytes and 4 checksum bytes
      if (data.length > 6) {
        try {
          const stripped = data.slice(2, data.length - 4);
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          await writer.write(stripped as any);
          await writer.close();
          const response = new Response(ds.readable);
          const buf = await response.arrayBuffer();
          return new Uint8Array(buf);
        } catch {
          // Continue
        }
      }
    }
  }

  // Fallback: in Node.js environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const zlib = await import('zlib');
      return new Promise((resolve) => {
        zlib.inflate(Buffer.from(data), (err, res) => {
          if (!err && res) {
            resolve(new Uint8Array(res));
          } else {
            zlib.inflateRaw(Buffer.from(data), (errRaw, resRaw) => {
              if (!errRaw && resRaw) {
                resolve(new Uint8Array(resRaw));
              } else {
                resolve(data);
              }
            });
          }
        });
      });
    } catch {
      // Continue
    }
  }

  return data;
}

/**
 * Extract readable text from raw PDF string/buffer
 */
export async function extractPdfTextFromBuffer(buffer: ArrayBuffer): Promise<string> {
  const uint8 = new Uint8Array(buffer);
  let rawPdf = '';
  // Convert buffer to latin1 string for byte-level regex matching
  for (let i = 0; i < uint8.length; i += 16384) {
    const chunk = uint8.subarray(i, Math.min(i + 16384, uint8.length));
    rawPdf += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }

  const extractedPieces: string[] = [];

  // Match all stream ... endstream blocks
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(rawPdf)) !== null) {
    const rawStream = match[1];
    const preHeader = rawPdf.slice(Math.max(0, match.index - 300), match.index);

    let streamBytes: Uint8Array;

    if (/ASCII85Decode/i.test(preHeader)) {
      streamBytes = decodeAscii85(rawStream);
    } else {
      const bytes = new Uint8Array(rawStream.length);
      for (let i = 0; i < rawStream.length; i++) {
        bytes[i] = rawStream.charCodeAt(i) & 255;
      }
      streamBytes = bytes;
    }

    if (/FlateDecode/i.test(preHeader)) {
      streamBytes = await decompressFlate(streamBytes);
    }

    let decodedStr = '';
    for (let i = 0; i < streamBytes.length; i += 16384) {
      const slice = streamBytes.subarray(i, Math.min(i + 16384, streamBytes.length));
      decodedStr += String.fromCharCode.apply(null, slice as unknown as number[]);
    }

    // Extract PDF string operators: (Text) Tj, ', "
    const tjRegex = /\(([^()]{1,})\)\s*(?:Tj|'|")/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(decodedStr)) !== null) {
      extractedPieces.push(tjMatch[1]);
    }

    // Extract array text operators: [(T) 12 (ext)] TJ
    const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
    let arrMatch: RegExpExecArray | null;
    while ((arrMatch = arrayTjRegex.exec(decodedStr)) !== null) {
      const innerTjRegex = /\(([^()]+)\)/g;
      let innerMatch: RegExpExecArray | null;
      while ((innerMatch = innerTjRegex.exec(arrMatch[1])) !== null) {
        extractedPieces.push(innerMatch[1]);
      }
    }
  }

  // Also check uncompressed text operators anywhere in file
  const plainTjRegex = /\(([^()]{2,})\)\s*(?:Tj|TJ)/g;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = plainTjRegex.exec(rawPdf)) !== null) {
    const candidate = pMatch[1];
    if (!extractedPieces.includes(candidate)) {
      extractedPieces.push(candidate);
    }
  }

  const cleanedText = extractedPieces
    .map((s) => s.replace(/\\([()\\])/g, '$1').replace(/\\[0-7]{1,3}/g, ' ').trim())
    .filter((s) => s.length > 0 && !/^\s+$/.test(s))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanedText;
}
