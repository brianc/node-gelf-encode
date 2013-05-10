gelf-encode
================

Encode GELF structured JavaScript objects to proper GELF binary packets ready to be sent out via UDP.  Supports chunked GELF transparently.


## why?

There are already a lot of graylog/gelf libraries for node.  Besides a bit of NIH I think they all have various problems, mostly doing _way_ more than one thing.

This module does _one thing only_.  It doesn't format your objects for you or attach properties.  It doesn't send things via UDP.

Also, care has been taken to never throw exceptions from this module.  The last thing you want is your logging layer to crash your application.  If you enounter an exception, open an issue or pull request immediately please. :smile:

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

//gelfEncode cares not about what type of object you want to encode
gelfEncode({lookMom: 'no hands!'}, function(err, buffers) {
  for(var i = 0; i < buffers.length; i++) {
    client.send(buffers[i]);
  }
});

//circular ojbect reference...uh oh....
var o = {};
o.o = o;
gelfEncode(o, function(err, buffers) {
  //err will be the JSON.stringify error
  //gelfEncode will not THROW on a JSON.stringify exception
  //because your logging layer crashing your app is unacceptable
});
```

## why use gelf?

- You can't log to disk in heroku, so you have to log to a remote server.
- Gelf is nice because it's udp so it doesn't block your application.  
- You can easily collect gelf messages on a remote server.
- Structured log messages make future log investigation easier.

## protip

__do not use graylog2__ (YMMV)

I spent three full days fiddling with graylog2 trying to get it to work, trying to track down UDP packet loss, installing ruby 1.9.3, bundler, passenger, apache, passenger+apache, mongodb, doing network traces, setting up UDP proxies :barf:

I eventually gave up.

I went to the graylog2 irc channel for help, but could get no one to respond

I went to the logstash irc channel for help, and was imediately greeted with friendly people suggesting I give logstash a try.

I installed logstash, configured the GELF input (2 lines in the config file), and was up and running in _less than an hour_.

__do this__

1. download http://logstash.net/
2. follow logstash installation instructions
3. clone ths somehwere: https://github.com/elasticsearch/kibana3
4. `cd kibana3`
5. `node scripts/server`
6. Have your mind completely blown to pieces. (example: http://demo.kibana.org/#/dashboard)
7. ask for help in #logstash or open an issue here if you have any problems

_note: for production use you'll want to use standalone elastic search and not the built in logstash instance. thankfully installing elasticsearch could not be easier_

## license

MIT
