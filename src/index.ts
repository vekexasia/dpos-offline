import {GenericWallet} from './wallet'
import {LiskWallet} from './liskWallet';
import * as txs from './trxTypes';

export const dposOffline = {
  transactions: txs,
  wallets: {GenericWallet, LiskLikeWallet: LiskWallet},
};