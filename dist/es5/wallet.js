"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sodium_1 = require("sodium");
var sha256_1 = require("./utils/sha256");
/**
 * Generic Abstract Wallet.
 */
var GenericWallet = (function () {
    function GenericWallet(secret) {
        this.createKeyPair(secret);
    }
    /**
     * Creates key pair from secret string
     * @param {string} secret
     */
    GenericWallet.prototype.createKeyPair = function (secret) {
        var hash = sha256_1.toSha256(secret);
        var keypair = sodium_1.api.crypto_sign_seed_keypair(hash);
        this._privKey = keypair.secretKey.toString('hex');
        this._publicKey = keypair.publicKey.toString('hex');
    };
    Object.defineProperty(GenericWallet.prototype, "privKey", {
        /**
         * @returns {string} privateKey
         */
        get: function () {
            return this._privKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GenericWallet.prototype, "publicKey", {
        /**
         * @returns {string} publicKey
         */
        get: function () {
            return this._publicKey;
        },
        enumerable: true,
        configurable: true
    });
    return GenericWallet;
}());
exports.GenericWallet = GenericWallet;
