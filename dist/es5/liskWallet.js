"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var wallet_1 = require("./wallet");
var bignumber_1 = require("./utils/bignumber");
var sha256_1 = require("./utils/sha256");
/**
 * Lisk Wallet.
 * you can use this wallet class to instantiate other coins wallets such as RISE,SHIFT,OXY etc.
 */
var LiskWallet = (function (_super) {
    __extends(LiskWallet, _super);
    function LiskWallet(secret, suffix) {
        if (suffix === void 0) { suffix = 'L'; }
        var _this = _super.call(this, secret) || this;
        _this.suffix = suffix;
        return _this;
    }
    Object.defineProperty(LiskWallet.prototype, "address", {
        /**
         * @returns {string} derived address.
         */
        get: function () {
            if (typeof (this._address) == 'undefined') {
                this.deriveAddress();
            }
            return this._address;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * calculates the address from publicKey.
     */
    LiskWallet.prototype.deriveAddress = function () {
        var hash = sha256_1.toSha256(new Buffer(this.publicKey, 'hex'));
        var temp = new Buffer(8);
        for (var i = 0; i < 8; i++) {
            temp[i] = hash[7 - i];
        }
        this._address = "" + bignumber_1.bigNumberFromBuffer(temp).toString() + this.suffix;
    };
    return LiskWallet;
}(wallet_1.GenericWallet));
exports.LiskWallet = LiskWallet;
