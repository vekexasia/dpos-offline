import * as ByteBuffer from 'bytebuffer';
import * as empty from 'is-empty';
import { As } from 'type-tagger';
import { Overwrite } from 'utility-types';
import * as varuint from 'varuint-bitcoin';
import { toTransportable } from '../../../../utils/toTransportable';
import { Address } from '../../../interface';
import { IBaseTx, IBaseTxCodec } from '../../base';
import { RiseIdsHandler } from '../rise_address';
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

export abstract class BaseRiseV2Codec<T> implements IBaseTxCodec<RiseV2Transaction<T>, PostableRiseV2Transaction<T>> {
  public readonly identifier: string;
  public readonly type: number;
  public constructor(type: number, identifier: string) {
    this.type = type;
    this.identifier = identifier;
  }

  public calcBytes(tx: RiseV2Transaction<T>): Buffer {
    const bb = new ByteBuffer(1024, true);

    function encodeVarUint(buf: Buffer) {
      return Buffer.concat([varuint.encode(buf.length), buf]);
    }

    bb.writeUint8(tx.type);
    bb.writeUint32(tx.version);
    bb.writeUint32(tx.timestamp);

    bb.append(encodeVarUint(tx.senderPubData));
    bb.append(encodeVarUint(tx.recipientId ? RiseIdsHandler.addressToBytes(tx.recipientId) : Buffer.alloc(0)));

    // TODO: use some arbitrary precision lib to serialize it into a buff
    bb.writeUint64(parseInt(tx.amount, 10));
    bb.writeUint64(parseInt(tx.fee, 10));

    bb.append(encodeVarUint(this.assetBytes(tx)));
    bb.flip();
    return new Buffer(bb.toBuffer());
  }

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
      type         : null,
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
    toRet.senderPubData = isAddressV2(toRet.senderId)
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

  public fromBytes(buff: Buffer): RiseV2Transaction<T> {

    let offset = 0;
    function readVarUint() {
      const length = varuint.decode(buff, offset);
      offset += varuint.decode.bytes;
      return readSlice(length);
    }

    function readUint8() {
      const toRet = buff.readUInt8(offset);
      offset += 1;
      return toRet;
    }
    function readUint32() {
      const toRet = buff.readUInt32LE(offset);
      offset += 4;
      return toRet;
    }
    function readUint64() {
      const [second, first] = [
        readUint32(),
        readUint32(),
      ];
      return first * 2 ** 32 + second;
    }
    function readSlice(howMuch: number) {
      const toRet = buff.slice(offset, offset + howMuch);
      offset += howMuch;
      return toRet;
    }

    return {
      // tslint:disable object-literal-sort-keys
      id: RiseIdsHandler.calcTxIdFromBytes(buff),
      type: readUint8(),
      version: readUint32(),
      timestamp: readUint32(),
      ...(() => {
        const senderPubData = readVarUint() as Buffer & As<'pubData'>;
        return {
          senderId: RiseIdsHandler.addressFromPubData(senderPubData),
          senderPubData,
        };
      })(),
      recipientId: RiseIdsHandler.addressFromBytes(readVarUint()),
      amount: `${readUint64()}`,
      fee: `${readUint64()}`,
      asset: this.assetFromBytes(readVarUint()),
      signatures: (() => {
        return new Array(Math.floor((buff.length - offset) / 64))
          .fill(null)
          .map(() => readSlice(64) as Buffer & As<'signature'>);
      })(),
      // tslint:enable object-literal-sort-keys
    };
  }

  protected abstract assetBytes(tx: RiseV2Transaction<T>): Buffer;
  protected abstract assetFromBytes(buf: Buffer): T;

}
