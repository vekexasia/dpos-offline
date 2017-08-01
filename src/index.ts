import { LiskWallet } from './liskWallet';
import * as txs from './trxTypes';
import { GenericWallet } from './wallet';

export const dposOffline = {
  transactions: txs,
  wallets     : {GenericWallet, LiskLikeWallet: LiskWallet},
};
