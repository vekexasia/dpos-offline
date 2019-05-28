import { As } from 'type-tagger';
import { Address } from './interface';
import { Lisk } from './lisk';
import { ILiskTransaction } from './lisk';

const SHIFTFees = {
  // 'multisignature'   : 50000000,
    'register-delegate': 6000000000,
    'second-signature' : 10000000,
    'send'             : 1000000,
    'vote'             : 100000000,
};

export const Shift: typeof Lisk = {
  ...Lisk,
  msgs: {
    ... Lisk.msgs,
    prefix: new Buffer('Shift Signed Message:\n', 'utf8'),
  },
  txs: {
    ... Lisk.txs,
    transform<T = any>(tx: ILiskTransaction) {
      const t = Lisk.txs.transform(tx);
      if (!tx.fee) {
        t.fee = [
          SHIFTFees.send,
          SHIFTFees['second-signature'],
          SHIFTFees['register-delegate'],
          SHIFTFees.vote,
        ][t.type];
      }
      return t;
    },
  },
  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    return Lisk.calcAddress(publicKey).replace('R', 'S') as Address;
  },
};

Shift.msgs._codec = Shift;
Shift.txs._codec  = Shift;
