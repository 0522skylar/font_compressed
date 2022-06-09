let fs = require('fs')
let path = require('path')
let _lodash = require('lodash')
let codePoints = require('code-points');
const { range } = require('express/lib/request');

function getFontFolder() {
    return path.resolve({
        win32: '/Windows/fonts',
        darwin: '/Library/Fonts',
        linux: '/usr/share/fonts/truetype'
    }[process.platform]);
}

function getFonts() {
    return fs.readdirSync(getFontFolder());
}

function getPureText(str) {
    let emptyTextMap = {};
    function replaceEmpty(word) {
        emptyTextMap[word] = 1;
        return '';
    }


    let pureText = String(str)
    .trim()
    .replace(/[\s]/g, replaceEmpty)
    .replace(/[\u2028]/g, '')
    .replace(/[\u2029]/g, '');

    let emptyText = Object.keys(emptyTextMap).join('');

    return pureText + emptyText;
}


function getUniqText(str) {
    return _lodash.uniq(
        str.split('')
    ).join('');
}

// 基础字符
// "!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}"
let basicText = String.fromCharCode.apply(this, _lodash,range(33, 126))

function getSubsetText(opts) {
    let text = opts.text || '';

    text && opts.trim && (text = getPureText(text));

    opts.basicText && (text += basicText);
    return text;
}


// 返回字符的unicode码
function string2unicodes(str) {
    return _lodash(codePoints(str));
}

exports.getFontFolder = getFontFolder;
exports.getFonts = getFonts;
exports.getPureText = getPureText;
exports.getUniqText = getUniqText;
exports.getSubsetText = getSubsetText;
exports.string2unicodes = string2unicodes;

