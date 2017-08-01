import { BaseTx } from './BaseTx';

/**
 * Send coins transaction
 */
export class SendTx extends BaseTx {
  public type: number = 0;

  constructor() {
    super({});
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean) {
    return null;
  }
}
