import * as ByteBuffer from 'bytebuffer';
import * as empty from 'is-empty';
import * as Long from 'long';
import * as varuint from 'varuint-bitcoin';
import { BaseRiseCodec, RiseV2Transaction } from '../base_rise';
import { RiseIdsHandler } from '../rise_address';

export abstract class BaseRiseV1Codec<T> extends BaseRiseCodec<T> {

  public calcBytes(tx: RiseV2Transaction<T>): Buffer {
    const assetBytes = this.assetBytes(tx);
    const bb         = new ByteBuffer(1 + 4 + 32 + 32 + 8 + 8 + 64 + 64 + assetBytes.length, true);

    const recipientV2 = !empty(tx.recipientId) && !/^[0-9]+R$/.test(tx.recipientId);

    bb.writeByte(tx.type);
    bb.writeUint32((recipientV2 ? 2 ** 30 : 0) + tx.timestamp);
    bb.append(tx.senderPubData);

    if (recipientV2) {
      const address = RiseIdsHandler.addressToBytes(tx.recipientId);
      bb.append(varuint.encode(address.length));
      bb.append(address);
    } else if (empty(tx.recipientId)) {
      bb.append(Buffer.alloc(8).fill(0));
    } else {
      bb.append(RiseIdsHandler.addressToBytes(tx.recipientId));
    }

    // tslint:disable-next-line no-string-literal
    bb['writeLong'](tx.amount);

    bb.append(assetBytes);
    bb.flip();
    return new Buffer(bb.toBuffer());
  }

  public fromBytes(buff: Buffer): RiseV2Transaction<T> {
    throw new Error('V1 transaction types do not support deserializing from bytes');
  }

  protected assetFromBytes(buf: Buffer): T {
    throw new Error('V1 transaction types do not support deserializing from bytes');
  }
}
