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
var BaseTx_1 = require("./BaseTx");
/**
 * Out transfer dapp transaction
 */
var OutTransferTx = (function (_super) {
    __extends(OutTransferTx, _super);
    function OutTransferTx(asset) {
        var _this = _super.call(this, asset) || this;
        _this.type = 7;
        return _this;
    }
    OutTransferTx.prototype.getChildBytes = function (skipSignature, skipSecondSign) {
        return Buffer.concat([
            Buffer.from(this.asset.outTransfer.dappId, 'utf8'),
            Buffer.from(this.asset.outTransfer.transactionId, 'utf8'),
        ]);
    };
    return OutTransferTx;
}(BaseTx_1.BaseTx));
exports.OutTransferTx = OutTransferTx;
