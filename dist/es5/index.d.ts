import { GenericWallet } from './wallet';
import { LiskWallet } from './liskWallet';
import * as txs from './trxTypes';
export declare const dposUtils: {
    transactions: typeof txs;
    wallets: {
        GenericWallet: typeof GenericWallet;
        LiskLikeWallet: typeof LiskWallet;
    };
};
