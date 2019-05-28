import * as ByteBuffer from 'bytebuffer';
import { As } from 'type-tagger';
import * as varuint from 'varuint-bitcoin';
import { BaseRiseCodec, RiseV2Transaction } from '../base_rise';
import { RiseIdsHandler } from '../rise_address';

export abstract class BaseRiseV2Codec<T> extends BaseRiseCodec<T> {
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

  protected abstract assetFromBytes(buf: Buffer): T;
}
