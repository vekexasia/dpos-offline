import { ISendTx, LiskSendAsset } from '../../lisk';
import { RiseV2Transaction } from '../base_rise';
import { BaseRiseV1Codec } from './base_v1';

export class RiseSendV1TxCodec extends BaseRiseV1Codec<LiskSendAsset> {

  constructor() {
    super(0, 'send');
  }

  public calcFees(tx: ISendTx): number {
    return 10000000;
  }

  public transform(from: ISendTx): RiseV2Transaction<LiskSendAsset> {
    const s = super.transform(from);

    s.amount = from.amount;
    s.recipientId = from.recipient;
    if (from.memo) {
      throw new Error('Rise V1 send transaction does not support memo field');
    }
    return s;
  }

  protected assetBytes(tx: RiseV2Transaction<LiskSendAsset>): Buffer {
    return Buffer.alloc(0);
  }

}
