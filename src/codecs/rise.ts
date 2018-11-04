import { As } from 'type-tagger';
import { Address } from './interface';
import { Lisk, LiskTransaction } from './lisk';

export const Rise: typeof Lisk = {
  ...Lisk,
  msgs: {
    ...Lisk.msgs,
    prefix: new Buffer('RISE Signed Message:\n', 'utf8'),
  },
  txs : {
    ...Lisk.txs,
    baseFees: {
      'multisignature'   : 500000000,
      'register-delegate': 2500000000,
      'second-signature' : 500000000,
      'send'             : 10000000,
      'vote'             : 100000000,
    },
    toPostable(tx: LiskTransaction<any>) {
      const ri = Lisk.txs.toPostable(tx);
      return {
        ...ri,
        amount  : parseInt(ri.amount, 10),
        fee     : parseInt(ri.fee, 10),
        senderId: this._codec.calcAddress(tx.senderPublicKey),
      };
    },
  },
  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    return Lisk.calcAddress(publicKey).replace('L', 'R') as Address;
  },
};

Rise.msgs._codec = Rise;
Rise.txs._codec  = Rise;
