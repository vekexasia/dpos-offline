"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var liskWallet_1 = require("./liskWallet");
var txs = require("./trxTypes");
var wallet_1 = require("./wallet");
exports.dposOffline = {
    transactions: txs,
    wallets: { GenericWallet: wallet_1.GenericWallet, LiskLikeWallet: liskWallet_1.LiskWallet },
};
