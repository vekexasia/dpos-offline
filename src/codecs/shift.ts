import { As } from 'type-tagger';
import { Address } from './interface';
import { LiskCodec } from './lisk';

export const ShiftCodec: typeof LiskCodec = {
  ...LiskCodec,
  baseFees: {
    'multisignature'   : 50000000,
    'register-delegate': 6000000000,
    'second-signature' : 10000000,
    'send'             : 1000000,
    'vote'             : 100000000,
  },
  msgs: {
    ... LiskCodec.msgs,
    prefix: new Buffer('Shift Signed Message:\n', 'utf8'),
  },
  txs: {
    ... LiskCodec.txs,
  },
  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    return LiskCodec.calcAddress(publicKey).replace('L', 'S') as Address;
  },
};

ShiftCodec.msgs._codec = ShiftCodec;
ShiftCodec.txs._codec = ShiftCodec;
