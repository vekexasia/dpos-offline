import { BaseTx } from './BaseTx';

export interface IInTransferAsset {
  inTransfer: { dappId: string };
}

/**
 * In transfer transaction
 */
export class InTransferTx extends BaseTx<IInTransferAsset> {
  public type: number = 6;

  constructor(asset?: IInTransferAsset) {
    super(asset);
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer {
    return Buffer.from(this.asset.inTransfer.dappId, 'utf8');
  }
}
