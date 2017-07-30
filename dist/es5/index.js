"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wallet_1 = require("./wallet");
var liskWallet_1 = require("./liskWallet");
var txs = require("./trxTypes");
exports.dposUtils = {
    transactions: txs,
    wallets: { GenericWallet: wallet_1.GenericWallet, LiskLikeWallet: liskWallet_1.LiskWallet },
};
