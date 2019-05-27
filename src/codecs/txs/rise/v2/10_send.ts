import { ISendTx } from '../../lisk';
import { BaseRiseV2Codec, RiseV2Transaction } from './base_v2';
import { Overwrite } from 'utility-types';

// tslint:disable-next-line
export type RiseV2SendAsset = {
  data: Buffer
};
export type ISendRiseV2Tx = Overwrite<ISendTx, { readonly memo?: Buffer, identifier: 'send-v2'}>;

export class RiseSendV2TxCodec extends BaseRiseV2Codec<RiseV2SendAsset> {

  constructor() {
    super(10, 'send-v2');
  }

  public transform(from: ISendTx): RiseV2Transaction<RiseV2SendAsset> {
    const s = super.transform(from);
    if (from.memo) {
      s.asset = {
        data: Buffer.from(from.memo, 'hex'),
      };
    }
    return s;
  }

  public calcFees(tx: ISendTx): number {
    const memoLength = Buffer.from(tx.memo || '', 'hex').length;
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
