
let _lodash = require('lodash')

let fs = require('fs')
let path = require('path')
let isTtf = require('is-ttf')

let through = require('through2')

let replaceExt = require('replace-ext')
let b2a = require('b3b').b2a;

let tpl = fs.readFileSync(
    path.resolve(__dirname, '../lib/font-face.tpl')
).toString('utf-8');

let rednerCss = _lodash.template(tpl);


function listUnicode(unicode) {
    return unicode.map(function(u) {
        return '\\' + u.toString(16);
    }).join(',');
}
// 从ttf对象中获取glyf列表
function getGlyfList(ttf) {
    let glyfList = [];
    // 排除空的glyf
    let filtered = ttf.glyf.filter(function(g) {
        return g.name !== '.notdef'
        && g.name !== '.null'
        && g.name !== 'nonmarkingreturn'
        && g.unicode && g.unicode.length;
    })
    // 格式化glyf信息
    filtered.forEach(function(g) {
        glyfList.push({
            code: '&#x' + g.unicode[0].toString(16) + ';',

            codeName: listUnicode(g.unicode),
            name: g.name || 'uni' + g.unicode[0].toString(16)
        });
    })

    // 获取字体名字
    function getFontFamily(fontInfo, ttf, opts) {
        let fontFamily = opts.fontFamily;
        if(typeof fontFamily === 'function') {
            fontFamily = fontFamily(_lodash.cloneDeep(fontInfo), ttf);
        }

        return fontFamily || ttf.name.fontFamily || fontInfo.fontFile;
    }
}

// css压缩插件
module.exports = function(opts) {
    opts = opts || {};

    return through.ctor({
        objectMode: true
    }, function(file, enc, cb) {
        // 检查是否为null
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

        this.push(file.clone(false));

        file.path = replaceExt(file.path, '.css');

        let fontFile = opts.fileName || path.basename(file.path, '.css');

        let fontInfo = {
            fontFile: fontFile,
            fontPath: '',
            base64: '',
            plyph: false,
            iconPrefix: 'icon',
            local: false
        };

        _lodash.extend(fontInfo, opts);

        let ttfObject = file.ttfObject || {
            name: {}
        };

        if(opts.glyf && ttfObject.glyf) {
            _lodash.extend(
                fontInfo,
                getGlyfList(ttfObject)
            )
        }

        fontInfo.fontFamily = getFontFamily(fontInfo, ttfObject, opts);

        if(opts.asFileName) {
            fontInfo.fontFamily = fontFile;
        }

        if(opts.base64) {
            fontInfo.base64 = '' + 'data:application/x-font-ttf;charset=uft-8;base64,' + b2a(file.contents);
        }

        if(fontInfo.local ===  true) {
            fontInfo.local = fontInfo.fontFamily;
        }

        let output = _lodash.attempt(function(data) {
            return Buffer.from(rednerCss(data));
        }, fontInfo);

        if(_lodash.isError(output)) {
            cb(output, file);
        } else {
            file.contents = output;
            cb(null, file);
        }
         
    })
}