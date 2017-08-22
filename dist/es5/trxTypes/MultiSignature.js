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
var ByteBuffer = require("bytebuffer");
var BaseTx_1 = require("./BaseTx");
/**
 * Multi signature transaction.
 */
var MultiSignatureTx = (function (_super) {
    __extends(MultiSignatureTx, _super);
    function MultiSignatureTx(asset) {
        var _this = _super.call(this, asset) || this;
        _this.type = 4;
        _this.amount = 0;
        return _this;
    }
    MultiSignatureTx.prototype.getChildBytes = function (skipSignature, skipSecondSign) {
        var keyGroupBuf = Buffer.from(this.asset.multisignature.keysgroup.join(''), 'utf8');
        var bb = new ByteBuffer(1 + 1 + keyGroupBuf.length, true);
        bb.writeByte(this.asset.multisignature.min);
        bb.writeByte(this.asset.multisignature.lifetime);
        // tslint:disable-next-line prefer-for-of
        for (var i = 0; i < keyGroupBuf.length; i++) {
            bb.writeByte(keyGroupBuf[i]);
        }
        bb.flip();
        return bb.toBuffer();
    };
    return MultiSignatureTx;
}(BaseTx_1.BaseTx));
exports.MultiSignatureTx = MultiSignatureTx;
