import { IRegisterDelegateTx, LiskRegDelegateAsset } from '../../lisk';
import { RiseV2Transaction } from '../base_rise';
import { BaseRiseV1Codec } from './base_v1';

export class RiseRegDelegateV1TxCodec extends BaseRiseV1Codec<LiskRegDelegateAsset> {

  constructor() {
    super(2, 'register-delegate');
  }

  public calcFees(tx: IRegisterDelegateTx): number {
    return 2500000000;
  }

  public transform(from: IRegisterDelegateTx): RiseV2Transaction<LiskRegDelegateAsset> {
    const s = super.transform(from);
    s.asset = { delegate: { username: from.identifier } };
    return s;
  }

  protected assetBytes(tx: RiseV2Transaction<LiskRegDelegateAsset>): Buffer {
    return Buffer.from(tx.asset.delegate.username, 'utf8');
  }

}
