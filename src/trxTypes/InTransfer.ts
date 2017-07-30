import {BaseTx} from './BaseTx';

export interface InTransferAssetType {
  inTransfer: { dappId: string }
}

/**
 * In transfer transaction
 */
export class InTransferTx extends BaseTx<InTransferAssetType> {
  type: number = 6;

  constructor(asset?: InTransferAssetType) {
    super(asset);
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer {
    return Buffer.from(this.asset.inTransfer.dappId, 'utf8');
  }


}