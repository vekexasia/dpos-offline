import * as bech32 from 'bech32-buffer';
import * as ByteBuffer from 'bytebuffer';
import * as empty from 'is-empty';
import { As } from 'type-tagger';
import { Omit, Overwrite } from 'utility-types';
import * as varuint from 'varuint-bitcoin';
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

    bytes(tx: LiskTransaction<any>, signOpts: SignOptions) {
      const assetBytes = this.getChildBytes(tx);
      const bb         = new ByteBuffer(1 + 4 + 32 + 32 + 8 + 8 + 64 + 64 + assetBytes.length, true);
      const isRecipientV2 = !empty(tx.recipientId) && !/^[0-9]+R$/.test(tx.recipientId);

      bb.writeByte(tx.type);
      bb.writeUint32(( isRecipientV2 ? 2 ** 30 : 0 ) + tx.timestamp);
      bb.append(tx.senderPublicKey);

      if (empty(tx.recipientId)) {
        bb.append(Buffer.alloc(8).fill(0));
      } else {
        if (/^[0-9]+R$/.test(tx.recipientId)) {
          bb.append(this.getAddressBytes(tx.recipientId));
        } else {
          const addressBytes = this.getAddressBytes(tx.recipientId);
          bb.append(varuint.encode(addressBytes.length));
          bb.append(addressBytes);
        }
      }

      // tslint:disable-next-line no-string-literal
      bb['writeLong'](tx.amount);

      bb.append(assetBytes);
      if (!signOpts.skipSignature && tx.signature) {
        bb.append(tx.signature);
      }
      if (!signOpts.skipSecondSign && tx.signSignature) {
        bb.append(tx.signSignature);
      }

      bb.flip();
      return new Buffer(bb.toBuffer());
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

Rise.msgs._codec = Rise;
Rise.txs._codec  = Rise;
