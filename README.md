node-gelf-encode
================

Encode GELF json to proper GELF binary packets ready to be sent out via UDP.

## api

### gelfEncode(Object json, [string compressionType], [int packetSize], Function callback(Error err, Buffer[] packets))

_Object json_ - the object to encode to binary gelf packets. gelf-encode makes no assumptions about this object: it is totally up to you to ensure it is 
a proper gelf message.  Example:

```js
var message = {
  version: "1.0",
  host: "localhost",
  facility: "testing",
  short_message: "some short message",
  _extra1: "some extra data",
  _extra2: 123
};

gelfEncode(message, function(err, buffers) {

});
```

_String compressionType_ - can be either `deflate` or `gzip` - default is `deflate`

_int packetSize_ - size of each packet in bytes.  Recommended is ~500.  Default is `566`

_Function callback_ - callback takes 2 arguments, an `Error` if an error occurred and an array of buffers otherwise.  These buffers are ready to be broadcast directly over UDP.

## usage

Combine gelf-encode with [https://github.com/brianc/node-udp-client] for dead simple GELF logging.

```js
var gelfEncode = require('gelf-encode');
var UpdClient = require('udp-client');

var client = new UdpClient(12201, 'localhost');

var message = {
  version: "1.0",
  host: "localhost",
  facility: "testing",
  short_message: "some short message",
  _extra1: "some extra data"
};

gelfEncode(message, function(err, buffers) {
  if(err) return console.log('error encoding to gelf', err);
  for(var i = 0; i < buffers.length; i++) {
    client.send(buffers[i]);
  }
});

```

## why use gelf?

You can't log to disk in heroku.  Gelf is nice because it's udp so it doesn't block your application.  You can easily collect gelf messages on another server using logstash.

## license

MIT
