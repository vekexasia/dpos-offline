"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BigNumber = require("bignumber.js");
/**
 * Calculates BigNumber from buffer representation
 * @param {Buffer} buf
 * @param {ToFromBufferOpts} opts
 */
exports.bigNumberFromBuffer = function (buf, opts) {
    if (opts === void 0) { opts = {}; }
    var endian = opts.endian || 'big';
    var size = opts.size === 'auto' ? Math.ceil(buf.length) : (opts.size || 1);
    if (buf.length % size !== 0) {
        throw new RangeError('Buffer length (' + buf.length + ')'
            + ' must be a multiple of size (' + size + ')');
    }
    var hex = [];
    for (var i = 0; i < buf.length; i += size) {
        var chunk = [];
        for (var j = 0; j < size; j++) {
            chunk.push(buf[i + (endian === 'big' ? j : (size - j - 1))]);
        }
        hex.push(chunk
            .map(function (c) { return (c < 16 ? '0' : '') + c.toString(16); })
            .join(''));
    }
    return new BigNumber(hex.join(''), 16);
};
/**
 * Exports bignumber to buffer.
 * @returns {Buffer}
 */
exports.bigNumberToBuffer = function (bignum, opts) {
    if (opts === void 0) { opts = {}; }
    var endian = opts.endian || 'big';
    var hex = bignum.toString(16);
    if (hex.charAt(0) === '-')
        throw new Error('Converting negative numbers to Buffers not supported yet');
    var size = opts.size === 'auto' ? Math.ceil(hex.length / 2) : (opts.size || 1);
    var len = Math.ceil(hex.length / (2 * size)) * size;
    var buf = new Buffer(len);
    // Zero-pad the hex string so the chunks are all `size` long
    while (hex.length < 2 * len)
        hex = '0' + hex;
    var hx = hex
        .split(new RegExp('(.{' + (2 * size) + '})'))
        .filter(function (s) {
        return s.length > 0;
    });
    hx.forEach(function (chunk, i) {
        for (var j = 0; j < size; j++) {
            var ix = i * size + (endian === 'big' ? j : size - j - 1);
            buf[ix] = parseInt(chunk.slice(j * 2, j * 2 + 2), 16);
        }
    });
    return buf;
};
