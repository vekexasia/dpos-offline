"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var libsodium = require("libsodium-wrappers");
var innerNacl = __assign({}, libsodium, {
    crypto_sign_seed_keypair: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args[0] instanceof Buffer) {
            // Buffer is unsupported
            args[0] = new Uint8Array(args[0]);
        }
        var toRet = libsodium.crypto_sign_seed_keypair.apply(libsodium, args);
        toRet.publicKey = toBuffer(toRet.publicKey);
        toRet.secretKey = toBuffer(toRet.privateKey);
        delete toRet.privateKey;
        return toRet;
    },
    crypto_sign_detached: function (hash, privKey) {
        var toRet = libsodium.crypto_sign_detached(hash, privKey);
        return toBuffer(toRet);
    },
});
function toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}
exports.api = innerNacl;
