import { BaseTx } from './BaseTx';

/**
 * Send coins transaction
 */
export class SendTx extends BaseTx<{data: string}> {
  public type: number = 0;

  constructor(asset?: {data: string}) {
    super(asset);
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean) {
    if (this.asset && this.asset.data) {
      return new Buffer(this.asset.data, 'utf8');
    }
    return null;
  }
}
