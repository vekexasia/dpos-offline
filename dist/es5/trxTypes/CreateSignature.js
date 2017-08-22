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
 * Transaction of type "Create second signature".
 */
var CreateSignatureTx = (function (_super) {
    __extends(CreateSignatureTx, _super);
    function CreateSignatureTx() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 1;
        _this.amount = 0;
        return _this;
    }
    CreateSignatureTx.prototype.getChildBytes = function (skipSignature, skipSecondSign) {
        var bb = new ByteBuffer(32, true);
        BaseTx_1.BaseTx.hexKeyInByteBuffer(this.asset.signature.publicKey, bb);
        bb.flip();
        return bb.toBuffer();
    };
    return CreateSignatureTx;
}(BaseTx_1.BaseTx));
exports.CreateSignatureTx = CreateSignatureTx;
