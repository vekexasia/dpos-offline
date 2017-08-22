import { LiskWallet } from './liskWallet';
import * as txs from './trxTypes';
import { GenericWallet } from './wallet';
export declare const dposOffline: {
    transactions: typeof txs;
    wallets: {
        GenericWallet: typeof GenericWallet;
        LiskLikeWallet: typeof LiskWallet;
    };
};
