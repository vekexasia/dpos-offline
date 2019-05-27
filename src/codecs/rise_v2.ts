import * as bech32 from 'bech32-buffer';
import * as empty from 'is-empty';
import * as Long from 'long';
import { As } from 'type-tagger';
import { Overwrite } from 'utility-types';
import { toSha256 } from '../utils/sha256';
import { toTransportable } from '../utils/toTransportable';
import { Address, ICoinCodec, ICoinCodecTxs, IKeypair } from './interface';
import { Rise, RiseTransaction } from './rise';
import { riseCodecUtils } from './txs/rise/utils';
import { IRegisterDelegateTx, IRegisterSecondSignature, ISendTx, IVoteTx, LiskTransaction } from './txs/lisk';
import { LiskCoinCodecMsgs } from './lisk';
import {
  IRegisterDelegateRiseV2Tx,
  IRegisterSecondSignatureRiseV2Tx,
  ISendRiseV2Tx,
  IVoteRiseV2Tx,
  RiseV2Transaction
} from './txs/rise/v2';
// tslint:disable max-line-length
// tslint:disable-next-line

export type PostableRiseV2Transaction<T> = Overwrite<RiseV2Transaction<T>, {
  senderPubData: string;
  signatures: string[];
}>;

export type IRiseV2Transaction =  IVoteTx<string>
  | IVoteRiseV2Tx
  | ISendTx
  | ISendRiseV2Tx
  | IRegisterDelegateTx
  | IRegisterDelegateRiseV2Tx
  | IRegisterSecondSignature
  | IRegisterSecondSignatureRiseV2Tx;

export interface IRiseV2CoinCodecTxs extends ICoinCodecTxs<RiseV2Transaction<any> | LiskTransaction<any>, IRiseV2Transaction, PostableRiseV2Transaction<any>> {
  getAddressBytes(address: Address): Buffer;

}

export class RiseV2Txs implements IRiseV2CoinCodecTxs {

  // tslint:disable-next-line
  public _codec: ICoinCodec<this, any>;

  public bytes(tx: RiseV2Transaction<any> | LiskTransaction<any>): Buffer {
    return riseCodecUtils.findCodecFromType(tx.type)
      .calcFullBytes(tx as any);
  }

  public calcSignature(tx: RiseV2Transaction<any>, kp: IKeypair | string): Buffer & As<'signature'> {
    return this._codec.raw.sign(
      toSha256(this.bytes(tx)),
      typeof (kp) === 'string' ? this._codec.deriveKeypair(kp) : kp
    );
  }
  public createAndSign(tx: IRiseV2Transaction, kp: IKeypair | string): PostableRiseV2Transaction<any>;
  public createAndSign(tx: IRiseV2Transaction, kp: IKeypair | string, inRawFormat: true): RiseV2Transaction<any>;
  public createAndSign(tx: IRiseV2Transaction, kp: IKeypair | string, net: 'main'|'test', inRawFormat?: true): RiseV2Transaction<any>;

  // tslint:disable-next-line variable-name
  public createAndSign(tx: IRiseV2Transaction, _kp: IKeypair | string, net?: 'main'|'test'|true, inRawFormat?: true): PostableRiseV2Transaction<any> | RiseV2Transaction<any> {
    const kp = typeof (_kp) === 'string' ? this._codec.deriveKeypair(_kp) : _kp;
    if (!net) {
      net = 'main';
    }
    if (net === true) {
      net = 'main';
      inRawFormat = true;
    }

    if (empty(tx.sender)) {
      tx.sender = {
        address  : this._codec.calcAddress(kp.publicKey, net),
        publicKey: kp.publicKey,
      };
    }

    const signableTx = this.castToV2Format(this.transform(tx, net));
    const signedTx   = this.sign(signableTx, kp);
    if (inRawFormat) {
      return signedTx;
    }
    return this.toPostable(signedTx);
  }

  public createNonce(): string & As<'nonce'> {
    return `${Math.floor(
      (Date.now() - Date.UTC(2016, 4, 24, 17, 0, 0, 0)) / 1000
    )}` as string & As<'nonce'>;
  }

  public fromPostable<T>(ptx: PostableRiseV2Transaction<any>): RiseV2Transaction<T> {
    return this.castToV2Format(
      riseCodecUtils.findCodecFromType(ptx.type)
      .fromPostable(ptx as any)
    );
  }

  public getAddressBytes(address: Address): Buffer {
    return Rise.txs.getAddressBytes(address);
  }

  public identifier(tx: RiseV2Transaction<any>): string & As<'txIdentifier'> {
    const hash = toSha256(this.bytes(tx));
    const temp = [];
    for (let i = 0; i < 8; i++) {
      temp.push(hash[7 - i]);
    }
    return Long.fromBytesBE(temp, true).toString() as string & As<'txIdentifier'>;
  }

  // tslint:disable-next-line variable-name
  public sign(tx: RiseV2Transaction<any>, _kp: IKeypair | string): RiseV2Transaction<any> {
    const kp = typeof (_kp) === 'string' ? this._codec.deriveKeypair(_kp) : _kp;
    if (!tx.senderPubData) {
      if ([0, 1, 2, 3].indexOf(tx.type) !== -1) {
        tx.senderPubData = kp.publicKey;
      } else {
        tx.senderPubData = Buffer.concat([new Buffer([1]), kp.publicKey]) as Buffer & As<'publicKey'>;
      }
    }
    tx.signatures = tx.signatures || [];
    tx.signatures.push(this.calcSignature(tx, kp));
    tx.id = this.identifier(tx);
    return tx;
  }

  public toPostable(tx: RiseV2Transaction<any>): PostableRiseV2Transaction<any> {
    return toTransportable(tx);
  }

  public transform<T = any>(tx: IRiseV2Transaction, net: 'main' | 'test'): RiseV2Transaction<T> | LiskTransaction<T> {
    tx.sender.address = tx.sender.address || this._codec.calcAddress(tx.sender.publicKey, net, 'v1');
    return riseCodecUtils.findCodecFromIdentifier(tx.kind)
      .transform(tx);
  }

  public verify(tx: RiseV2Transaction<any>, signature?: Buffer & As<'signature'>, pubKey?: Buffer & As<'publicKey'>): boolean {
    const hash = toSha256(
      this.bytes(tx));
    return this._codec.raw.verify(hash, signature, pubKey);
  }

  public castToV2Format<T>(tx: RiseTransaction<T> | RiseV2Transaction<T>): RiseV2Transaction<T> {
    if (typeof (tx as RiseV2Transaction<T>).version === 'number') {
      return tx as RiseV2Transaction<T>;
    }
    return this.fromV1Format(tx as RiseTransaction<T>);
  }

  public fromV1Format<T>(tx: RiseTransaction<T>): RiseV2Transaction<T> {
    const asset: any = tx.asset;
    if (tx.type === 1 || tx.type === 11) {
      asset.signature.publicKey = Buffer.from(asset.signature.publicKey, 'hex');
    }

    return {
      amount: `${tx.amount}`,
      asset,
      fee: `${tx.fee}`,
      id: tx.id,
      recipientId: tx.recipientId,
      senderId: tx.senderId,
      senderPubData: tx.senderPublicKey,
      signatures: [
        tx.signature,
        tx.signSignature,
        ...tx.signatures,
      ]
        .filter((s) => typeof(s) !== 'undefined' && s !== null),
      timestamp: tx.timestamp,
      type: tx.type,
      version: 0,
    };
  }

  public toV1Format<T>(tx: RiseV2Transaction<T>): RiseTransaction<T> {
    return {
      ...tx,
      amount: parseInt(tx.amount, 10),
      fee: parseInt(tx.fee, 10),
      senderPublicKey: tx.senderPubData as Buffer & As<'publicKey'>,
      signSignature: tx.signatures[1],
      signature: tx.signatures[0],
    };
  }

}

export const RiseV2: ICoinCodec<RiseV2Txs, LiskCoinCodecMsgs> = {
  ...Rise,
  txs: new RiseV2Txs(),

  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>, net: 'main' | 'test' = 'main', type: 'v0' | 'v1' = 'v1') {
    if (type === 'v0') {
      return Rise.calcAddress(publicKey);
    }
    const pubKey = Buffer.isBuffer(publicKey) ? publicKey : Buffer.from(publicKey, 'hex');
    return bech32.encode(
      net === 'main' ? 'rise' : 'tise',
      Buffer.concat([
        Buffer.from([1]),
        pubKey,
      ])
    ) as string & As<'address'>;
  },

};

console.log('risev2');
RiseV2.msgs._codec = RiseV2;
RiseV2.txs._codec  = RiseV2;
