import { As } from 'type-tagger';
import { Address } from './interface';
import { Rise } from './rise';

export const Shift: typeof Rise = {
  ...Rise,
  msgs: {
    ... Rise.msgs,
    prefix: new Buffer('Shift Signed Message:\n', 'utf8'),
  },
  txs: {
    ... Rise.txs,
    baseFees: {
      'multisignature'   : 50000000,
      'register-delegate': 6000000000,
      'second-signature' : 10000000,
      'send'             : 1000000,
      'vote'             : 100000000,
    },
  },
  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    return Rise.calcAddress(publicKey).replace('R', 'S') as Address;
  },
};

Shift.msgs._codec = Shift;
Shift.txs._codec  = Shift;
