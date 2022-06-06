const combine = require('stream-combiner')
const concat = require('concat-stream');
const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;
const bufferToVinyl = require('buffer-to-vinyl');
const vfs = require('vinyl-fs');

class FontMinTest extends EventEmitter {
  constructor() {
    if (!(this instanceof FontMinTest)) {
      return new FontMinTest();
    }
    EventEmitter.call(this);
  }
  streams = [];
  src(file) {
    if (!arguments.length) {
      return this._src
    }
    this._src = arguments;
    return this;
  }
  dest(dir) {
    if (!arguments.length) {
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
    callback = callback || function () {};
    let stream = this.createStream();
    stream.on('error', callback);
    stream.pipe(concat(callback.bind(null, null)));
    return stream
  }
  getFiles() {
    if (Buffer.isBuffer(this._src[0])) {
      return bufferToVinyl.stream(this._src[0])
    }
    return vfs.src.apply(vfs, this.src())
  }
  createStream() {
    this.streams.unshift(this.getFiles());
    if (this.streams.length === 1) {
      this.use(Fontmin.otf2ttf());
      this.use(Fontmin.ttf2eot());
      this.use(Fontmin.ttf2woff());
      this.use(Fontmin.ttf2woff2());
      this.use(Fontmin.ttf2svg());
      this.use(Fontmin.css());
    }

    if (this.dest()) {
      this.streams.push(
        vfs.dest.apply(vfs, this.dest())
      );
    }

    return combine(this.streams);
  }

}

Fontmin.plugins = [
  'glyph',
  'ttf2eot',
  'ttf2woff',
  'ttf2woff2',
  'ttf2svg',
  'css',
  'svg2ttf',
  'svgs2ttf',
  'otf2ttf'
];

// export pkged plugins
Fontmin.plugins.forEach(function (plugin) {
  Fontmin[plugin] = require('./plugins/' + plugin);
});

/**
* Module exports
*/
module.exports = Fontmin;

// exports util, mime
module.exports.util = exports.util = require('./lib/util');
module.exports.mime = exports.mime = require('./lib/mime-types');
