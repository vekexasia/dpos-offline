import {BaseTx} from './BaseTx';

export interface IOutTransferAsset {
  outTransfer: { dappId: string, transactionId: string };
}

/**
 * Out transfer dapp transaction
 */
export class OutTransferTx extends BaseTx<IOutTransferAsset> {
  public type: number = 7;

  constructor(asset?: IOutTransferAsset) {
    super(asset);
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer {
    return Buffer.concat([
      Buffer.from(this.asset.outTransfer.dappId, 'utf8'),
      Buffer.from(this.asset.outTransfer.transactionId, 'utf8'),
    ]);
  }
}
