var assert = require('assert');
var util = require('util');
var zlib = require('zlib');
var crypto = require('crypto');

var ok = require('okay');
var gelfEncode = require(__dirname + '/../');

describe('gelf-encode', function() {
  it('returns error in callback on invalid json', function(done) {
    var o = {};
    o.o = o;
    gelfEncode(o, function(err, buffers) {
      assert(err);
      assert(err instanceof Error);
      assert(err.message.indexOf('circular') > -1, "message should say something about 'circular'");
      done();
    });
  });

  it('encodes a single packet', function(done) {
    gelfEncode('omg', function(err, buffers) {
      assert.ifError(err);
      assert(util.isArray(buffers), 'buffers should be an array');
      assert.equal(buffers.length, 1);
      done();
    });
  });

  it('encodes a large packet', function(done) {
    var full_message = crypto.pseudoRandomBytes(32000).toString('utf8');
    var msg = {
      version: '1.0',
      short_message: 'huge text',
      full_message: full_message,
      timestamp: new Date().getTime(),
      facility: 'happiness'
    };
    gelfEncode(msg, function(err, buffers) {
      assert.ifError(err);
      assert(buffers.length > 1, 'expected more than 1 buffer');
      var id = buffers[0].slice(2, 10);
      buffers.forEach(function(buffer, index) {
        assert.equal(buffer[0], 0x1e);
        assert.equal(buffer[1], 0x0f);
        for(var i = 0; i < 8; i++) {
          assert.equal(id[i], buffer[i+2]);
        }
        assert.equal(buffer[10], index);
        assert.equal(buffer[11], buffers.length);
      });
      done();
    });
  });

  it('returns an error on a seriously wtfpwdbbqly large packet', function(done) {
    var full_message = crypto.pseudoRandomBytes(320000).toString('utf8');
    var msg = {
      version: '1.0',
      short_message: 'huge text',
      full_message: full_message,
      timestamp: new Date().getTime(),
      facility: 'happiness'
    };
    gelfEncode(msg, function(err, buffers) {
      assert(err);
      done();
    });
  });
});
