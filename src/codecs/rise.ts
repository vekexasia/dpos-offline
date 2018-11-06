import { As } from 'type-tagger';
import { Omit, Overwrite } from 'utility-types';
import { Address, ICoinCodec, ICoinCodecTxs, IKeypair, SenderType } from './interface';
import {
  ILiskTransaction,
  Lisk,
  LiskCoinCodecMsgs,
  LiskTransaction,
  PostableLiskTransaction,
  SignOptions
} from './lisk';

export type RiseTransaction<T> = LiskTransaction<T>;

export type PostableRiseTransaction<T> = Overwrite<PostableLiskTransaction<T>, {
  amount: number,
  fee: number
}>;

export type RiseCoinCodecTxs =
  ICoinCodecTxs<RiseTransaction<any>, ILiskTransaction, SignOptions, PostableRiseTransaction<any>>
  & {
  getAddressBytes(address: Address): Buffer;
  getChildBytes(tx: LiskTransaction<any>): Buffer;
};

export const Rise: ICoinCodec<RiseCoinCodecTxs, LiskCoinCodecMsgs> = {
  ...Lisk,
  msgs: {
    ...Lisk.msgs,
    prefix: new Buffer('RISE Signed Message:\n', 'utf8'),
  },
  txs : {
    ...Lisk.txs,
    _codec  : null as any,
    baseFees: {
      'multisignature'   : 500000000,
      'register-delegate': 2500000000,
      'second-signature' : 500000000,
      'send'             : 10000000,
      'vote'             : 100000000,
    },

    // tslint:disable-next-line max-line-length
    createAndSign(tx: Omit<ILiskTransaction, 'sender'> & { sender?: SenderType }, kp: IKeypair | string, inRawFormat?: true) {
      const t = Lisk.txs.createAndSign(tx, kp);
      if (inRawFormat) {
        return this.toPostable(t);
      }
      return t;
    },

    toPostable(tx: RiseTransaction<any>) {
      const ri = Lisk.txs.toPostable(tx);
      return {
        ...ri,
        amount  : parseInt(ri.amount, 10),
        fee     : parseInt(ri.fee, 10),
        senderId: this._codec.calcAddress(tx.senderPublicKey),
      };
    },

    fromPostable(tx: PostableRiseTransaction<any>) {
      return Lisk.txs.fromPostable({
        ...tx,
        amount: `${tx.amount}`,
        fee   : `${tx.fee}`,
      });
    },
  },
  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    return Lisk.calcAddress(publicKey).replace('L', 'R') as Address;
  },
};

Rise.msgs._codec = Rise;
Rise.txs._codec  = Rise;
