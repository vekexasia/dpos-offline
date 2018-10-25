import { LiskWallet } from './liskWallet';
import { RiseWallet } from './riseWallet';
import * as txs from './trxTypes';
import * as utils from './utils/dposUtils';
import { GenericWallet } from './wallet';

export const dposOffline = {
  transactions: txs,
  utils,
  wallets     : { GenericWallet, LiskLikeWallet: LiskWallet, RiseWallet },
};

export { GenericWallet, LiskWallet, RiseWallet };

export * from './trxTypes';
export * from './utils/dposUtils';
export * from './utils/liskifyTX';
