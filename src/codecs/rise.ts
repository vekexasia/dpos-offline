import * as bech32 from 'bech32-buffer';
import { As } from 'type-tagger';
import { Omit, Overwrite } from 'utility-types';
import { Address, ICoinCodec, ICoinCodecTxs, IKeypair, SenderType } from './interface';
import { riseCodecUtils } from './txs/rise/utils';
console.log('asdrise');
import { LiskTransaction, PostableLiskTransaction } from './txs/lisk';
import { ILiskTransaction, Lisk, LiskCoinCodecMsgs } from './lisk';

export type RiseTransaction<T> = LiskTransaction<T>;

export type PostableRiseTransaction<T> = Overwrite<PostableLiskTransaction<T>, {
  amount: number,
  fee: number
}>;

export type RiseCoinCodecTxs =
  ICoinCodecTxs<RiseTransaction<any>, ILiskTransaction, PostableRiseTransaction<any>>
  & {
  getAddressBytes(address: Address): Buffer;
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

    getAddressBytes(address: Address): Buffer {
      if (/^[0-9]+R$/.test(address)) {
        return Lisk.txs.getAddressBytes.call(this, address);
      }
      // TODO: Check address invalidity.
      const res = bech32.decode(address);
      return Buffer.concat([
        Buffer.from(res.prefix, 'ascii'),
        new Buffer(res.data),
      ]);
    },

    bytes(tx: LiskTransaction<any>) {
      return riseCodecUtils.findCodecFromType(tx.type)
        .calcFullBytes(tx as any);

    },
    // tslint:disable-next-line max-line-length
    createAndSign(tx: Omit<ILiskTransaction, 'sender'> & { sender?: SenderType }, kp: IKeypair | string, inRawFormat?: true) {
      const t = Lisk.txs.createAndSign.call(this, tx, kp, true);
      if (inRawFormat) {
        return t;
      }
      return this.toPostable(t);
    },

    toPostable(tx: RiseTransaction<any>) {
      const ri = Lisk.txs.toPostable.call(this, tx);
      return {
        ...ri,
        amount  : parseInt(ri.amount, 10),
        fee     : parseInt(ri.fee, 10),
        senderId: this._codec.calcAddress(tx.senderPublicKey),
      };
    },

    fromPostable(tx: PostableRiseTransaction<any>) {
      return Lisk.txs.fromPostable.call(this, {
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
console.log('rise');
Rise.msgs._codec = Rise;
Rise.txs._codec  = Rise;
