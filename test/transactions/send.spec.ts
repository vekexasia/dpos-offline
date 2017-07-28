import {SendTx} from '../../src/trxTypes/Send'
import {TransactionType} from 'risejs';
import {expect} from 'chai';
import { BaseTx } from "../../src/trxTypes/BaseTx";

describe('Transactions.send', () => {
  it('should have type 0', () => {
    const t = new SendTx(1);
    expect(t.type).to.be.deep.eq(TransactionType.SEND);
  });
  it('should inherit from BaseTx', () => {
    const t = new SendTx(1);
    expect(t).to.be.instanceof(BaseTx)
  });

  it('should return null on getChildBytes', () => {
    const t = new SendTx(1);
    expect(t['getChildBytes'](false, false)).to.be.null;
  });
});