import { As } from 'type-tagger';
import { Address, SenderType } from '../interface';

/**
 * Base Transaction interface
 */
export interface IBaseTx {
  /**
   * Fees. (Optional If Codec supports auto-fee-assign)
   */
  readonly fee?: string;
  /**
   * Transaction nonce. (In Lisk/Rise it's timestamp) in string format
   */
  readonly nonce?: string & As<'nonce'>;
  /**
   * Sender of this transaction
   */
  sender?: SenderType;
  /**
   * The Existing (if so) signature of such tx.
   */
  signature?: Buffer & As<'signature'>;
  /**
   * The existing extra signatures of such tx.
   */
  extraSignatures?: Array<Buffer & As<'signature'>>;
}

export interface IBaseTxCodec<T, PostableT> {
  readonly type: number;
  readonly identifier: string;
  calcFees(tx: IBaseTx): number;
  transform(from: IBaseTx): T;
  calcBytes(tx: T, addressBytes: (add: Address) => Buffer): Buffer;
  calcFullBytes(tx: T, addressBytes: (add: Address) => Buffer): Buffer;
  toPostable(tx: T): PostableT;
  fromPostable(tx: PostableT): T;
  fromBytes(buff: Buffer): T;
}
