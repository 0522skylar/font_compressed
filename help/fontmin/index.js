const combine = require('stream-combiner')
const concat = require('concat-stream');
const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;
const bufferToVinyl = require('buffer-to-vinyl');
const vfs = require('vinyl-fs');

class FontMinTest extends EventEmitter{
  constructor() {
    if(!(this instanceof FontMinTest)) {
      return new FontMinTest();
    }
    EventEmitter.call(this);
  }
  streams=[];
  src(file) {
    if(!arguments.length) {
      return this._src
    } 
    this._src = arguments;
    return this;
  }
  dest(dir) {
    if(!arguments.length) {
      return this._dest;
    }

    this._dest = arguments;
    return this;
  }
  use(plugin) {
    this.streams.push(typeof plugin === 'function' ? plugin() : plugin);
    return this;
  }
  run(callback) {
    callback = callback || function() {};
    let stream = this.createStream();
    stream.on('error', callback);
    stream.pipe(concat(callback.bind(null, null)));
    return stream
  }
  getFiles() {
    if(Buffer.isBuffer(this._src[0])) {
      return bufferToVinyl.stream(this._src[0])
    }
    return vfs.src.apply(vfs, this.src())
  }
  createStream() {
    this.streams.unshift(this.getFiles())
  }
}
