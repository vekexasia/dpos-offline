import * as empty from 'is-empty';
import { As } from 'type-tagger';
import { Overwrite } from 'utility-types';
import { toTransportable } from '../../../utils/toTransportable';
import { Address } from '../../interface';
import { IBaseTx, IBaseTxCodec } from '../base';
import { RiseIdsHandler } from './rise_address';
// tslint:disable max-line-length
// tslint:disable-next-line
export type RiseV2Transaction<AssetType> = {
  recipientId: Address;
  senderId: Address;
  amount: string;
  senderPubData: Buffer & As<'publicKey' | 'pubData'>;
  timestamp: number;
  fee: string;
  asset: AssetType;
  type: number;
  id: string;
  version: number;
  signatures: Array<Buffer & As<'signature'>>;
};

export type PostableRiseV2Transaction<T> = Overwrite<RiseV2Transaction<T>, {
  senderPubData: string;
  signatures: string[];
}>;

function isAddressV2(addr: Address): boolean {
  return !/[0-9]+R/.test(addr);
}

export abstract class BaseRiseCodec<T> implements IBaseTxCodec<RiseV2Transaction<T>, PostableRiseV2Transaction<T>> {
  public readonly identifier: string;
  public readonly type: number;
  public constructor(type: number, identifier: string) {
    this.type = type;
    this.identifier = identifier;
  }

  public abstract calcBytes(tx: RiseV2Transaction<T>): Buffer;

  public calcFullBytes(tx: RiseV2Transaction<T>): Buffer {
    return Buffer.concat([
      this.calcBytes(tx),
      ... tx.signatures,
    ]);
  }

  public fromPostable(ptx: PostableRiseV2Transaction<T>): RiseV2Transaction<T> {
    return {
      ...ptx,
      senderPubData: (ptx.senderPubData ? Buffer.from(ptx.senderPubData, 'hex') : null) as Buffer & As<'publicKey' | 'pubData'>,
      signatures   : (ptx.signatures ? ptx.signatures.map((s) => Buffer.from(s, 'hex')) : null) as Array<Buffer & As<'signature'>>,
    };
  }

  public toPostable(tx: RiseV2Transaction<T>): PostableRiseV2Transaction<T> {
    return toTransportable(tx);
  }

  public transform(from: IBaseTx): RiseV2Transaction<T> {
    const toRet: RiseV2Transaction<T> = {
      amount       : '0',
      asset        : null,
      fee          : null,
      id           : null,
      recipientId  : null,
      senderId     : null,
      senderPubData: null,
      signatures   : [],
      timestamp    : null,
      type         : this.type,
      version      : 0,
    };

    if (empty(from.fee)) {
      toRet.fee = `${this.calcFees(from)}`;
    } else {
      toRet.fee = from.fee;
    }

    if (empty(from.sender.publicKey)) {
      throw new Error('Please set sender publicKey');
    }
    toRet.senderPubData = isAddressV2(from.sender.address)
      ? Buffer.concat([new Buffer([1]), from.sender.publicKey]) as Buffer & As<'pubData'>
      : from.sender.publicKey;
    toRet.senderId        = from.sender.address || from.sender.address;

    if (!empty(from.nonce)) {
      toRet.timestamp = parseInt(from.nonce, 10);
    } else {
      toRet.timestamp = parseInt(this.createNonce(), 10);
    }

    if (from.signature) {
      toRet.signatures.push(from.signature);
    }
    if (from.extraSignatures) {
      toRet.signatures.push(...from.extraSignatures);
    }
    return toRet;
  }

  public abstract calcFees(tx: IBaseTx): number;

  public createNonce() {
    return `${Math.floor(
      (Date.now() - Date.UTC(2016, 4, 24, 17, 0, 0, 0)) / 1000
    )}` as string & As<'nonce'>;
  }

  public abstract fromBytes(buf: Buffer): RiseV2Transaction<T>;
  protected abstract assetBytes(tx: RiseV2Transaction<T>): Buffer;
  protected abstract assetFromBytes(buf: Buffer): T;

}
