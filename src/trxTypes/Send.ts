import { BaseTx } from './BaseTx';
import { TransactionType } from 'risejs';

export class SendTx extends BaseTx {
  type: number = TransactionType.SEND;

  constructor(public fee:number) {
    super()
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean) {
    return null
  }

  protected innerCreate() {
    ; // NOOP
  }
}