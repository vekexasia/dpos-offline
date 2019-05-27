import { ISendTx, LiskSendAsset, LiskSendTxCodec, LiskTransaction } from '../../lisk';

export class RiseSendV1TxCodec extends LiskSendTxCodec {

  public transform(from: ISendTx): LiskTransaction<LiskSendAsset> {
    const s = super.transform(from);
    if (from.memo) {
      throw new Error('Rise V1 send transaction does not support memo field');
    }
    return s;
  }

  protected assetBytes(tx: LiskTransaction<LiskSendAsset>): Buffer {
    return Buffer.alloc(0);
  }

}
