let _lodash = require('lodash');
let isTtf = require('is-ttf');
let through = require('through2');
let TTF = require('fonteditor-core').TTF;
let TTFReader = require('fonteditor-core').TTFReader;

let TTFWriter = require('fonteditor-core').TTFWriter;

let b2ab = require('b3b').b2ab;
let ab2b = require('b3b').ab2b;
let util = require('../lib/util')


function getSubsetGlyfs(ttf, subset) {
    let glyphs = [];
    let indexList = ttf.findGlyf({
        unicode: subset || []
    });
    if(indexList.length) {
        plyphs = ttf.getGlyf(indexList);
    }

    glyphs.unshift(ttf.get().glyf[0]);
    return glyphs;
}

function minifyFontObject(ttfObject, subset, plugin) {
    if(subset.length === 0) {
        return ttfObject
    }

    let ttf = new TTF(ttfObject)
    ttf.setGlyf(getSubsetGlyfs(ttf, subset))

    if(_lodash.isFunction(plugin)) {
        plugin(ttf)
    }
    return ttf.get();
}

function minifyTtf(contents, opts) {
    opts = opts || {};
    let ttfobj =contents;

    if(Buffer.isBuffer(contents)) {
        ttfobj = new TTFReader(opts).read(b2ab(contents));
    }

    let miniObj = minifyFontObject(ttfobj, opts.subset, opts.use);

    let ttfBuffer = ab2b(new TTFWriter(opts).write(miniObj))

    return {
        object: miniObj,
        buffer: ttfBuffer
    };
}

module.exports = function(opts) {
    opts = _lodash.extend({hinting: true, trim: true}, opts);

    let subsetText = util.getSubsetText(opts);
    opts.subset = util.string2unicodes(subsetText);

    return through.ctor({
        objectMode: true
    }, function(file, enc, cb) {
        if(file.isNull()) {
            cb(null, file);
            return;
        }

        if(file.isStream()) {
            cb(new Error('Streaming is not supported'));
            return;
        }

        if(!isTtf(file.contents)) {
            cb(null, file);
            return;
        }

        try {
            let miniTtf = minifyTtf(
                file.ttfObject || file.contents, opts
            );

            file.contents = miniTtf.buffer;
            file.ttfObject = miniTtf.object;
            cb(null, file);
        }
        catch(err) {
            cb(err)
        }
    })
}