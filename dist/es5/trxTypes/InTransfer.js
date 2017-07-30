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
 * In transfer transaction
 */
var InTransferTx = (function (_super) {
    __extends(InTransferTx, _super);
    function InTransferTx(asset) {
        var _this = _super.call(this, asset) || this;
        _this.type = 6;
        return _this;
    }
    InTransferTx.prototype.getChildBytes = function (skipSignature, skipSecondSign) {
        return Buffer.from(this.asset.inTransfer.dappId, 'utf8');
    };
    return InTransferTx;
}(BaseTx_1.BaseTx));
exports.InTransferTx = InTransferTx;
