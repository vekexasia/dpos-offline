import {LiskWallet} from './liskWallet';
import * as txs from './trxTypes';
import * as utils from './utils/dposUtils';
import {GenericWallet} from './wallet';

export const dposOffline = {
  transactions: txs,
  utils,
  wallets     : { GenericWallet, LiskLikeWallet: LiskWallet },
};
