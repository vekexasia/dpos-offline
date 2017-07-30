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
 * Vote transactions
 */
var VoteTx = (function (_super) {
    __extends(VoteTx, _super);
    function VoteTx(asset) {
        var _this = _super.call(this, asset) || this;
        _this.type = 3;
        _this.amount = 0;
        return _this;
    }
    VoteTx.prototype.getChildBytes = function (skipSignature, skipSecondSign) {
        return this.asset && this.asset.votes ? Buffer.from(this.asset.votes.join(''), 'utf8') : null;
    };
    return VoteTx;
}(BaseTx_1.BaseTx));
exports.VoteTx = VoteTx;
