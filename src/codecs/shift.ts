import { As } from 'type-tagger';
import { Address } from './interface';
import { RiseCodec } from './rise';

export const ShiftCodec: typeof RiseCodec = {
  ...RiseCodec,
  msgs: {
    ... RiseCodec.msgs,
    prefix: new Buffer('Shift Signed Message:\n', 'utf8'),
  },
  txs: {
    ... RiseCodec.txs,
    baseFees: {
      'multisignature'   : 50000000,
      'register-delegate': 6000000000,
      'second-signature' : 10000000,
      'send'             : 1000000,
      'vote'             : 100000000,
    },
  },
  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    return RiseCodec.calcAddress(publicKey).replace('R', 'S') as Address;
  },
};

ShiftCodec.msgs._codec = ShiftCodec;
ShiftCodec.txs._codec = ShiftCodec;
