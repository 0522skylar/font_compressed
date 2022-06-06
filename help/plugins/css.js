
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

