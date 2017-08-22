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
var empty = require("is-empty");
var BaseTx_1 = require("./BaseTx");
/**
 * Dapp Transaction
 */
var DappTx = (function (_super) {
    __extends(DappTx, _super);
    function DappTx(asset) {
        var _this = _super.call(this, asset) || this;
        _this.type = 4;
        _this.amount = 0;
        return _this;
    }
    DappTx.prototype.getChildBytes = function (skipSignature, skipSecondSign) {
        var _this = this;
        var buf = Buffer.from(this.asset.dapp.name, 'utf8');
        Buffer.concat(['name', 'description', 'tags', 'link', 'icon']
            .map(function (what) { return _this.asset.dapp[what]; })
            .filter(function (item) { return !empty(item); })
            .map(function (item) { return Buffer.from(item, 'utf8'); }));
        var bb = new ByteBuffer(4 * 2, true);
        bb.writeInt(this.asset.dapp.type);
        bb.writeInt(this.asset.dapp.category);
        bb.flip();
        return Buffer.concat([buf, bb.toBuffer()]);
    };
    return DappTx;
}(BaseTx_1.BaseTx));
exports.DappTx = DappTx;
