let _lodash = require('lodash');
let isTtf = require('is-ttf');
let through = require('through2');
let TTF = require('fonteditor-core').TTF;
let TTFReader = require('fonteditor-core').TTFReader;

let TTFWriter = require('fonteditor-core').TTFWriter;

let b2ab = require('b3b').b2ab;
let ab2b = require('b3b').ab2b;
let util = require('../lib/util')