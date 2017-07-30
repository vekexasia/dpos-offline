"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var empty = require("is-empty");
var ByteBuffer = require("bytebuffer");
var BigNumber = require("bignumber.js");
var sodium_1 = require("sodium");
var bignumber_1 = require("../utils/bignumber");
var sha256_1 = require("../utils/sha256");
/**
 * Base transaction class.
 */
var BaseTx = (function () {
    function BaseTx(asset) {
        this.asset = asset;
        this.requesterPublicKey = null;
    }
    BaseTx.prototype.sign = function (signingPrivKey, signingSecondPrivKey) {
        if (empty(this.type) && this.type !== 0) {
            throw new Error("Unknown transaction type " + this.type);
        }
        if (empty(this.senderPublicKey)) {
            throw new Error("Sender Public Key is empty");
        }
        if (empty(this.timestamp) && this.timestamp < 0) {
            throw new Error("Invalid timestamp provided");
        }
        this.innerCreate();
        this._signature = this.createSignature(signingPrivKey).toString('hex');
        if (!empty(signingSecondPrivKey)) {
            this._secondSignature = this.createSignature(signingSecondPrivKey).toString('hex');
        }
        this._id = this.calcId();
        return this.toObj();
    };
    /**
     * Returns plain object representation of tx (if not signed error will be thrown)
     */
    BaseTx.prototype.toObj = function () {
        var toRet = {
            id: this._id,
            fee: this.fee,
            type: this.type,
            recipientId: this.recipientId,
            amount: this.amount,
            senderPublicKey: this.senderPublicKey,
            requesterPublicKey: this.requesterPublicKey,
            timestamp: this.timestamp,
            signature: this._signature,
            secondSignature: this._secondSignature || undefined,
            asset: this.asset
        };
        if (empty(toRet.secondSignature)) {
            delete toRet.secondSignature;
        }
        return toRet;
    };
    /**
     * Generate signature from given private key.
     * @param {string} privKey
     * @returns {Buffer}
     */
    BaseTx.prototype.createSignature = function (privKey) {
        var hash = this.getHash();
        return sodium_1.api.crypto_sign_detached(hash, new Buffer(privKey, 'hex'));
    };
    Object.defineProperty(BaseTx.prototype, "signature", {
        get: function () {
            if (empty(this._signature)) {
                throw new Error('Call create first');
            }
            return this._signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseTx.prototype, "id", {
        get: function () {
            if (empty(this._id)) {
                throw new Error('Call create first');
            }
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Calculates Tx id!
     * @returns {string}
     */
    BaseTx.prototype.calcId = function () {
        var hash = this.getHash();
        var temp = new Buffer(8);
        for (var i = 0; i < 8; i++) {
            temp[i] = hash[7 - i];
        }
        return bignumber_1.bigNumberFromBuffer(temp).toString();
    };
    /**
     * Gets raw hash of current tx
     */
    BaseTx.prototype.getHash = function () {
        return sha256_1.toSha256(this.getBytes());
    };
    /**
     * Calculates bytes of tx.
     * @param {boolean} skipSignature=false true if you don't want to account signature
     * @param {boolean} skipSecondSign=false true if you don't want to account second signature
     * @returns {Buffer}
     */
    BaseTx.prototype.getBytes = function (skipSignature, skipSecondSign) {
        if (skipSignature === void 0) { skipSignature = false; }
        if (skipSecondSign === void 0) { skipSecondSign = false; }
        var childBytes = this.getChildBytes(skipSignature, skipSecondSign);
        var assetSize = empty(childBytes) ? 0 : childBytes.length;
        var bb = new ByteBuffer(1 + 4 + 32 + 32 + 8 + 8 + 64 + 64 + assetSize, true);
        bb.writeByte(this.type);
        bb.writeInt(this.timestamp);
        BaseTx.hexKeyInByteBuffer(this.senderPublicKey, bb);
        if (!empty(this.requesterPublicKey)) {
            BaseTx.hexKeyInByteBuffer(this.requesterPublicKey, bb);
        }
        if (!empty(this.recipientId)) {
            var recipient = bignumber_1.bigNumberToBuffer(new BigNumber(this.recipientId.slice(0, -1)), { size: 8 });
            for (var i = 0; i < 8; i++) {
                bb.writeByte(recipient[i] || 0);
            }
        }
        else {
            for (var i = 0; i < 8; i++) {
                bb.writeByte(0);
            }
        }
        bb['writeLong'](this.amount);
        if (assetSize > 0) {
            for (var i = 0; i < assetSize; i++) {
                bb.writeByte(childBytes[i]);
            }
        }
        if (!skipSignature && !empty(this._signature)) {
            BaseTx.hexKeyInByteBuffer(this._signature, bb);
        }
        if (!skipSecondSign && !empty(this._secondSignature)) {
            BaseTx.hexKeyInByteBuffer(this._secondSignature, bb);
        }
        bb.flip();
        // TODO: Check? this returns an array buffer which does not
        // inherit from buffer (according to ts types).
        return new Buffer(bb.toBuffer());
    };
    /**
     * override this to allow asset and other fields creations.
     * for different tx types.
     */
    BaseTx.prototype.innerCreate = function () {
    };
    ;
    // chain style utilities.
    BaseTx.prototype.set = function (key, value) {
        this[key] = value;
        return this;
    };
    BaseTx.prototype.withRecipientId = function (recipientId) {
        return this.set('recipientId', recipientId);
    };
    BaseTx.prototype.withAmount = function (amount) {
        return this.set('amount', amount);
    };
    BaseTx.prototype.withSenderPublicKey = function (senderPublicKey) {
        return this.set('senderPublicKey', senderPublicKey);
    };
    BaseTx.prototype.withRequesterPublicKey = function (senderPublicKey) {
        return this.set('requesterPublicKey', senderPublicKey);
    };
    BaseTx.prototype.withTimestamp = function (timestamp) {
        return this.set('timestamp', timestamp);
    };
    BaseTx.prototype.withFees = function (fees) {
        return this.set('fee', fees);
    };
    /**
     * Utility to copy an hex string to a bytebuffer
     * @param {string} hex
     * @param {ByteBuffer} bb
     */
    BaseTx.hexKeyInByteBuffer = function (hex, bb) {
        var buf = Buffer.from(hex, 'hex');
        for (var i = 0; i < buf.length; i++) {
            bb.writeByte(buf[i]);
        }
    };
    return BaseTx;
}());
exports.BaseTx = BaseTx;
