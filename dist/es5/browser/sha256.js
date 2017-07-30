"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// NODE version uses crypto module
var sha256 = require("sha.js/sha256.js");
exports.toSha256 = function (what) { return new sha256().update(what).digest(); };
