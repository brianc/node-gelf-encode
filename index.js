var zlib = require('zlib');
var crypto = require('crypto');

var bufferSlice = require('buffer-slice');
var ok = require('okay');

var GELF_CHUNK_HEADER_LENGTH = 10;
var CHUNKED_GELF_HEADER = Buffer([0x1e, 0x0f]);

module.exports = function gelfEncode(message, compressType, chunkSize, callback) {
  if(typeof compressType == 'function') {
    callback = compressType;
    chunkSize = module.exports.chunkSize;
    compressType = module.exports.compressType;
  } else if(typeof chunkSize == 'function') {
    callback = chunkSize;
    chunkSize = module.exports.chunkSize;
  }
  var msg;
  try{
    msg = JSON.stringify(message);
  } catch(e) {
    return callback(e, null);
  }
  zlib[compressType](msg, ok(callback, function(buffer) {
    if(buffer.length <= chunkSize) {
      callback(null, [buffer])
    } else {
      var buffers = bufferSlice(buffer, chunkSize - 12);
      if(buffers.length > 128) {
        return callback(new Error('cannot encode a GELF message of more than 128 packets'));
      }
      //append GELF chunked header to each buffer
      var id = crypto.randomBytes(8);
      var result = [];
      var totalBuffer = Buffer([buffers.length]);
      for(var i = 0; i < buffers.length; i++) {
        var parts = [CHUNKED_GELF_HEADER, id, Buffer([i]), totalBuffer, buffers[i]];
        result.push(Buffer.concat(parts));
      }
      callback(null, result);
    }
  }));
};

module.exports.compressType = 'deflate';
module.exports.chunkSize = 566;
