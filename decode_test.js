import zlib from 'zlib';

// Let us inspect what the stream in ReportLab PDF contains.
// Looking at chunk 2: "17 0 obj Filter ASCII85Decode FlateDecode Length 2600 stream Gb! BAQ- q9SYfLND u8SNb ;SQi\" ...
// It uses ASCII85Decode and FlateDecode!
console.log("PDF streams in ReportLab are ASCII85 and Flate (zlib) encoded.");
