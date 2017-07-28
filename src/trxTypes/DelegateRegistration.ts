import { BaseTxType } from './BaseTxType';
import { TransactionType } from 'risejs';
import { Transaction } from '../transaction';
import * as empty from 'is-empty';

export class DelegateRegistration extends BaseTxType {
  type: number = TransactionType.DELEGATE;

  constructor(private fees:number) {
    super()
  }

  getFees(): number {
    return this.fees;
  }

  async verify(tx: Transaction<void>): Promise<{ res: boolean, reason?: string }> {
    if (empty(tx.recipientId)) {
      return {res: false, reason: 'Missing recipient'};
    }
    if (empty(tx.amount) || tx.amount <= 0) {
      return {res: false, reason: 'Invalid transaction amount'};
    }
    return {res: true};
  }

  getBytes(): number[] {
    return null;
  }

}