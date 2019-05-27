import { As } from 'type-tagger';
import { IBaseTx } from '../base';
import { BaseLiskCodec, LiskTransaction } from './base_lisk';

/**
 * Register Delegate Identifier
 */
export interface IRegisterDelegateTx extends IBaseTx {
  readonly kind: 'register-delegate';
  /**
   * The identifier/username/name of the delegate to register
   */
  readonly identifier: string & As<'delegateName'>;
}

// tslint:disable-next-line
export type LiskRegDelegateAsset = { delegate: { username: string } };

export class LiskRegDelegateTxCodec extends BaseLiskCodec<LiskRegDelegateAsset> {
  constructor() {
    super(2, 'register-delegate');
  }

  public calcFees(tx: IRegisterDelegateTx): number {
    return 2500000000;
  }

  public transform(from: IRegisterDelegateTx): LiskTransaction<LiskRegDelegateAsset> {
    const s = super.transform(from);
    s.asset = { delegate: { username: from.identifier } };
    return s;
  }

  protected assetBytes(tx: LiskTransaction<LiskRegDelegateAsset>): Buffer {
    return Buffer.from(tx.asset.delegate.username, 'utf8');
  }

}
