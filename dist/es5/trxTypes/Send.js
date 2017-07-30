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
 * Send coins transaction
 */
var SendTx = (function (_super) {
    __extends(SendTx, _super);
    function SendTx() {
        var _this = _super.call(this, {}) || this;
        _this.type = 0;
        return _this;
    }
    SendTx.prototype.getChildBytes = function (skipSignature, skipSecondSign) {
        return null;
    };
    SendTx.prototype.innerCreate = function () {
        ; // NOOP
    };
    return SendTx;
}(BaseTx_1.BaseTx));
exports.SendTx = SendTx;
