import { RecipientId } from '../../interface';
import { IBaseTx } from '../base';
import { BaseLiskCodec, LiskTransaction } from './base_lisk';

/**
 * Identifies a Send transaction
 */
export interface ISendTx extends IBaseTx {
  readonly kind: 'send';
  /**
   * Amount in Satoshi encoded as string
   */
  readonly amount: string;
  /**
   * Amount recipient
   */
  readonly recipient: RecipientId;
  /**
   * Optional Memo data. (If supported by the Coin)
   */
  readonly memo?: string;
}

// tslint:disable-next-line
export type LiskSendAsset = { data?: string };

export class LiskSendTxCodec extends BaseLiskCodec<LiskSendAsset> {

  constructor() {
    super(0, 'send');
  }

  public calcFees(tx: ISendTx): number {
    return 10000000;
  }

  public transform(from: ISendTx): LiskTransaction<LiskSendAsset> {
    const s = super.transform(from);
    s.amount = parseInt(from.amount, 10);
    s.recipientId = from.recipient;
    if (from.memo) {
      s.asset = { data: from.memo };
    }
    return s;
  }

  protected assetBytes(tx: LiskTransaction<LiskSendAsset>): Buffer {
    if (tx.asset && tx.asset.data) {
      return Buffer.from(tx.asset.data, 'utf8');
    }
    return Buffer.alloc(0);
  }

}
