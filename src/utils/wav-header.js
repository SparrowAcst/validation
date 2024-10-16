module.exports = function generateHeader(length, options) {
  options = options || {};
  var RIFF = new Buffer('RIFF');
  var WAVE = new Buffer('WAVE');
  var fmt  = new Buffer('fmt ');
  var data = new Buffer('data');

  var MAX_WAV = 4294967295 - 100;
  var endianness = 'LE';
  var format = 1; // raw PCM
  var channels = options.channels || 1;
  var sampleRate = options.sample_rate || options.sampleRate || 44100;
  var bitDepth = options.bits_per_sample || options.bitDepth || 16;

  var headerLength = 44;
  var dataLength = length || MAX_WAV;
  var fileSize = dataLength + headerLength;
  var header = new Buffer(headerLength);
  var offset = 0;

  // write the "RIFF" identifier
  RIFF.copy(header, offset);
  offset += RIFF.length;

  // write the file size minus the identifier and this 32-bit int
  header['writeUInt32' + endianness](fileSize - 8, offset);
  offset += 4;

  // write the "WAVE" identifier
  WAVE.copy(header, offset);
  offset += WAVE.length;

  // write the "fmt " sub-chunk identifier
  fmt.copy(header, offset);
  offset += fmt.length;

  // write the size of the "fmt " chunk
  // XXX: value of 16 is hard-coded for raw PCM format. other formats have
  // different size.
  header['writeUInt32' + endianness](16, offset);
  offset += 4;

  // write the audio format code
  header['writeUInt16' + endianness](format, offset);
  offset += 2;

  // write the number of channels
  header['writeUInt16' + endianness](channels, offset);
  offset += 2;

  // write the sample rate
  header['writeUInt32' + endianness](sampleRate, offset);
  offset += 4;

  // write the byte rate
  var byteRate = sampleRate * channels * bitDepth / 8;
  header['writeUInt32' + endianness](byteRate, offset);
  offset += 4;

  // write the block align
  var blockAlign = channels * bitDepth / 8;
  header['writeUInt16' + endianness](blockAlign, offset);
  offset += 2;

  // write the bits per sample
  header['writeUInt16' + endianness](bitDepth, offset);
  offset += 2;

  // write the "data" sub-chunk ID
  data.copy(header, offset);
  offset += data.length;

  // write the remaining length of the rest of the data
  header['writeUInt32' + endianness](dataLength, offset);
  offset += 4;

  // flush the header and after that pass-through "dataLength" bytes
  return header;
};