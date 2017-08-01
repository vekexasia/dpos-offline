import { BaseTx } from './BaseTx';

export interface IDelegateTxAsset {
  delegate: {
    username: string;
    publicKey: string;
  };
}

export class DelegateTx extends BaseTx<IDelegateTxAsset> {
  public type: number = 2;
  public amount       = 0;

  constructor(asset?: IDelegateTxAsset) {
    super(asset);
    if (typeof(asset) !== 'undefined') {
      asset.delegate.username = asset.delegate.username.toLowerCase().trim();
    }
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean) {
    return this.asset &&
      this.asset.delegate &&
      this.asset.delegate.username ? Buffer.from(this.asset.delegate.username, 'utf8') : null;
  }
}
