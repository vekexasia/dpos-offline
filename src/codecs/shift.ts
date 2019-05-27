import { As } from 'type-tagger';
import { Address } from './interface';
import { Rise } from './rise';
import { ILiskTransaction } from './lisk';

const shiftFees = {
  // 'multisignature'   : 50000000,
    'register-delegate': 6000000000,
    'second-signature' : 10000000,
    'send'             : 1000000,
    'vote'             : 100000000,
};

export const Shift: typeof Rise = {
  ...Rise,
  msgs: {
    ... Rise.msgs,
    prefix: new Buffer('Shift Signed Message:\n', 'utf8'),
  },
  txs: {
    ... Rise.txs,
    transform<T = any>(tx: ILiskTransaction) {
      const t = Rise.txs.transform(tx);
      if (!tx.fee) {
        t.fee = [
          shiftFees.send,
          shiftFees['second-signature'],
          shiftFees['register-delegate'],
          shiftFees.vote,
        ][t.type];
      }
      return t;
    },
  },
  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    return Rise.calcAddress(publicKey).replace('R', 'S') as Address;
  },
};

Shift.msgs._codec = Shift;
Shift.txs._codec  = Shift;
