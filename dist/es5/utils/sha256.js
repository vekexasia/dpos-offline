"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
exports.toSha256 = function (what) { return crypto
    .createHash('sha256')
    .update(what, 'utf8')
    .digest(); };
