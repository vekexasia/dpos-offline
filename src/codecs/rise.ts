import { As } from 'type-tagger';
import { Address } from './interface';
import { LiskCodec, LiskTransaction } from './lisk';

export const RiseCodec: typeof LiskCodec = {
  ...LiskCodec,
  msgs: {
    ...LiskCodec.msgs,
    prefix: new Buffer('RISE Signed Message:\n', 'utf8'),
  },
  txs : {
    ...LiskCodec.txs,
    baseFees: {
      'multisignature'   : 500000000,
      'register-delegate': 2500000000,
      'second-signature' : 500000000,
      'send'             : 10000000,
      'vote'             : 100000000,
    },
    toPostable(tx: LiskTransaction<any>) {
      const ri = LiskCodec.txs.toPostable(tx);
      return {
        ...ri,
        amount  : parseInt(ri.amount, 10),
        fee     : parseInt(ri.fee, 10),
        senderId: this._codec.calcAddress(tx.senderPublicKey),
      };
    },
  },
  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    return LiskCodec.calcAddress(publicKey).replace('L', 'R') as Address;
  },
};

RiseCodec.msgs._codec = RiseCodec;
RiseCodec.txs._codec  = RiseCodec;
