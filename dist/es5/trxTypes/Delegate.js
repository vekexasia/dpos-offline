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
var DelegateTx = (function (_super) {
    __extends(DelegateTx, _super);
    function DelegateTx(asset) {
        var _this = _super.call(this, asset) || this;
        _this.type = 2;
        _this.amount = 0;
        if (typeof (asset) !== 'undefined') {
            asset.delegate.username = asset.delegate.username.toLowerCase().trim();
        }
        return _this;
    }
    DelegateTx.prototype.getChildBytes = function (skipSignature, skipSecondSign) {
        return this.asset && this.asset.delegate && this.asset.delegate.username ? Buffer.from(this.asset.delegate.username, 'utf8') : null;
    };
    return DelegateTx;
}(BaseTx_1.BaseTx));
exports.DelegateTx = DelegateTx;
