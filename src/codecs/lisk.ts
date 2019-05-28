// tslint:disable max-line-length
import * as empty from 'is-empty';
import * as Long from 'long';
import { As } from 'type-tagger';
import { Omit, Overwrite } from 'utility-types';
import { encode as encodeVarInt } from 'varuint-bitcoin';
import { toSha256 } from '../utils/sha256';
import { ed25519 } from '../utils/sodium';
import {
  Address,
  ICoinCodec,
  ICoinCodecMsgs,
  ICoinCodecTxs,
  IKeypair,
  SenderType
} from './interface';
import { IBaseTx } from './txs/';
import {
  IRegisterDelegateTx,
  IRegisterSecondSignature,
  ISendTx,
  IVoteTx, liskCodecUtils,
  LiskTransaction,
  PostableLiskTransaction
} from './txs/lisk';

export interface IRegisterMultisignature extends IBaseTx {
  readonly kind: 'multisignature';
  readonly min: number;
  readonly lifetime: number;
  readonly config: {
    added: Array<Buffer & As<'publicKey'>>;
    removed: Array<Buffer & As<'publicKey'>>;
  };
}

export type ILiskTransaction =
  IVoteTx
  | ISendTx
  | IRegisterDelegateTx
  | IRegisterSecondSignature
  | IRegisterMultisignature;

// tslint:disable-next-line
export type LiskCoinCodecTxs = ICoinCodecTxs<LiskTransaction<any>, ILiskTransaction, PostableLiskTransaction<any>> & {
  getAddressBytes(address: Address): Buffer;
  bytesForSignature(tx: LiskTransaction<any>): Buffer
};
export type LiskCoinCodecMsgs = ICoinCodecMsgs & {
  readonly prefix: Buffer
  readonly signablePayload: (msg: Buffer | string) => Buffer;
};

export const Lisk: ICoinCodec<LiskCoinCodecTxs, LiskCoinCodecMsgs> = {
  txs: {
    _codec  : null,

    getAddressBytes(address: Address): Buffer {
      return new Buffer(Long.fromString(address.slice(0, -1)).toBytesBE());
    },

    bytes(tx: LiskTransaction<any>) {
      return liskCodecUtils.findCodecFromType(tx.type)
        .calcFullBytes(tx);
    },

    bytesForSignature(tx: LiskTransaction<any>): Buffer {
      return liskCodecUtils
        .findCodecFromType(tx.type)
        .calcBytes(tx as any);
    },

    transform<T = any>(tx: ILiskTransaction) {
      return liskCodecUtils.findCodecFromIdentifier(tx.kind)
        .transform(tx);
    },

    // tslint:disable-next-line max-line-length
    calcSignature(tx: LiskTransaction<any>, kp: IKeypair | string) {
      return this._codec.raw.sign(
        toSha256(this.bytes(tx)),
        typeof(kp) === 'string' ? this._codec.deriveKeypair(kp) : kp
      );
    },

    // tslint:disable-next-line variable-name
    createAndSign(tx: Omit<ILiskTransaction, 'sender'> & { sender?: SenderType }, _kp: IKeypair | string, inRawFormat?: true) {
      const kp = typeof(_kp) === 'string' ? this._codec.deriveKeypair(_kp) : _kp;
      if (empty(tx.sender)) {
        tx.sender = {
          address  : this._codec.calcAddress(kp.publicKey),
          publicKey: kp.publicKey,
        };
      }
      const signableTx = this.transform(tx);
      const signedTx   = this.sign(signableTx, kp);
      if (inRawFormat) {
        return signedTx;
      }
      return this.toPostable(signedTx);
    },

    // tslint:disable-next-line variable-name
    sign(tx: LiskTransaction<any>, _kp: IKeypair | string) {
      const kp     = typeof(_kp) === 'string' ? this._codec.deriveKeypair(_kp) : _kp;
      if (!tx.senderPublicKey) {
        tx.senderPublicKey = kp.publicKey;
      }
      tx.signature = this.calcSignature(tx, kp, {
        skipSecondSign: true,
        skipSignature : true,
      });
      tx.id        = this.identifier(tx);
      return tx;
    },

    verify(tx: LiskTransaction<any>, signature?: Buffer & As<'signature'>, pubKey?: Buffer & As<'publicKey'>): boolean {
      const hash              = toSha256(
        this.bytesForSignature(tx)
      );
      return this._codec.raw.verify(hash, signature || tx.signature, pubKey || tx.senderPublicKey);
    },

    toPostable<T = any>(tx: LiskTransaction<T>): PostableLiskTransaction<T> {
      return {
        ...liskCodecUtils.findCodecFromType(tx.type)
          .toPostable(tx),
        id: this.identifier(tx),
      };
    },

    fromPostable<T = any>(ptx: PostableLiskTransaction<T>): LiskTransaction<T> {
      return liskCodecUtils.findCodecFromType(ptx.type)
        .fromPostable(ptx);
    },

    identifier(tx: LiskTransaction<any>) {
      const hash = toSha256(this.bytes(tx));
      const temp = [];
      for (let i = 0; i < 8; i++) {
        temp.push(hash[7 - i]);
      }
      return Long.fromBytesBE(temp, true).toString() as string & As<'txIdentifier'>;
    },
  },

  msgs: {
    _codec: null,
    prefix: new Buffer('Lisk Signed Message:\n', 'utf8'),
    signablePayload(message: Buffer | string) {
      const msgBuf = Buffer.isBuffer(message) ? message : Buffer.from(message, 'utf8');
      const buf    = Buffer.concat([
        encodeVarInt(this.prefix.length),
        this.prefix,
        encodeVarInt(msgBuf.length),
        msgBuf,
      ]);
      return toSha256(toSha256(buf));
    },
    sign(message: Buffer | string, kp: IKeypair) {
      return (this._codec as typeof Lisk).raw.sign(this.signablePayload(message), kp);
    },
    verify(message: Buffer | string, signature: Buffer & As<'signature'>, publicKey: Buffer & As<'publicKey'>) {
      return (this._codec as typeof Lisk).raw.verify(this.signablePayload(message), signature, publicKey);
    },
  },

  deriveKeypair(secret: Buffer | string) {
    const hash = toSha256(Buffer.isBuffer(secret) ? secret : Buffer.from(secret, 'utf8'));
    const r    = ed25519.crypto_sign_seed_keypair(hash);
    return {
      privateKey: r.secretKey,
      publicKey : r.publicKey,
    };
  },

  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    const hash = toSha256(Buffer.isBuffer(publicKey) ? publicKey : Buffer.from(publicKey, 'hex'));
    const temp = [];
    for (let i = 0; i < 8; i++) {
      temp.push(hash[7 - i]);
    }
    return `${Long.fromBytesBE(temp, true).toString()}L` as Address;
  },

  raw: {
    sign(buf: Buffer, kp: IKeypair) {
      return ed25519.crypto_sign_detached(buf, kp.privateKey);
    },
    verify(buf: Buffer, signature: Buffer & As<'signature'>, publicKey: Buffer & As<'publicKey'>) {
      return ed25519.crypto_sign_verify_detached(signature, buf, publicKey);
    },
  },

};
Lisk.msgs._codec = Lisk;
Lisk.txs._codec  = Lisk;
