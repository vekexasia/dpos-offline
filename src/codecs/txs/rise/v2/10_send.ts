import { Overwrite } from 'utility-types';
import { ISendTx } from '../../lisk';
import { RiseV2Transaction } from '../base_rise';
import { BaseRiseV2Codec } from './base_v2';

// tslint:disable-next-line
export type RiseV2SendAsset = {
  data: Buffer
};
export type ISendRiseV2Tx = Overwrite<ISendTx, { readonly memo?: Buffer, kind: 'send-v2'}>;

export class RiseSendV2TxCodec extends BaseRiseV2Codec<RiseV2SendAsset> {

  constructor() {
    super(10, 'send-v2');
  }

  public transform(from: ISendRiseV2Tx): RiseV2Transaction<RiseV2SendAsset> {
    const s = super.transform(from);
    s.amount = from.amount;
    if (from.memo) {
      s.asset = {
        data: from.memo,
      };
    }
    s.recipientId = from.recipient;
    return s;
  }

  public calcFees(tx: ISendRiseV2Tx): number {
    const memoLength = (tx.memo || []).length;
    return 10000000 + 1000000 * memoLength;
  }

  protected assetBytes(tx: RiseV2Transaction<RiseV2SendAsset>): Buffer {
    if (tx.asset) {
      return tx.asset.data;
    }
    return Buffer.alloc(0);
  }

  protected assetFromBytes(buf: Buffer): RiseV2SendAsset {
    if (buf.length === 0) {
      return null;
    }
    return {data: buf};
  }

}
