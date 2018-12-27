import * as ByteBuffer from 'bytebuffer';
import * as empty from 'is-empty';
import { ICoinCodec } from './interface';
import { LiskCoinCodecMsgs, SignOptions } from './lisk';
import { Rise, RiseCoinCodecTxs, RiseTransaction } from './rise';

export const RiseV2: ICoinCodec<RiseCoinCodecTxs, LiskCoinCodecMsgs> = {
  ...Rise,
  txs: {
    ...Rise.txs,
    _codec: null as any,
    bytes(tx: RiseTransaction<any>, opts?: SignOptions): Buffer {
      const assetBytes = this.getChildBytes(tx);
      const bb         = new ByteBuffer(1 + 4 + 32 + 32 + 8 + 8 + 64 + 64 + assetBytes.length, true);
      bb.writeByte(tx.type);
      bb.writeUint32(tx.timestamp);
      bb.append(tx.senderPublicKey);
      if (!empty(tx.recipientId)) {
        bb.append(this.getAddressBytes(tx.recipientId));
      } else {
        bb.append(Buffer.alloc(8).fill(0));
      }

      // tslint:disable-next-line no-string-literal
      bb['writeLong'](tx.amount);
      // tslint:disable-next-line no-string-literal
      bb['writeLong'](tx.fee);

      bb.append(assetBytes);
      if (!opts.skipSignature && tx.signature) {
        bb.append(tx.signature);
        if (tx.signSignature) {
          bb.append(tx.signSignature);
        }
        if (Array.isArray(tx.signatures)) {
          for (let i = 0; i < tx.signatures.length; i++) {
            bb.append(tx.signatures[i]);
          }
        }
      }

      bb.flip();
      return new Buffer(bb.toBuffer());
    },
  },
};

RiseV2.msgs._codec = RiseV2;
RiseV2.txs._codec  = RiseV2;
