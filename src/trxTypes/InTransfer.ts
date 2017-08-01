import { BaseTx } from './BaseTx';

export interface IInTransferAssetType {
  inTransfer: { dappId: string };
}

/**
 * In transfer transaction
 */
export class InTransferTx extends BaseTx<IInTransferAssetType> {
  public type: number = 6;

  constructor(asset?: IInTransferAssetType) {
    super(asset);
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer {
    return Buffer.from(this.asset.inTransfer.dappId, 'utf8');
  }
}
