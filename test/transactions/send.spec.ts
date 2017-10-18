import { expect } from 'chai';
import { rise, TransactionType } from 'risejs';
import { BaseTx, ITransaction } from '../../src/trxTypes/BaseTx';
import { SendTx } from '../../src/trxTypes/Send';
import { testPrivKey, testPubKey } from '../testConsts';

// tslint:disable-next-line:no-var-requires
const txs = require(`${__dirname}/../data/sendTxs.json`);

describe('Transactions.send', () => {
  it('should have type 0', () => {
    const t = new SendTx();
    expect(t.type).to.be.deep.eq(TransactionType.SEND);
  });
  it('should inherit from BaseTx', () => {
    const t = new SendTx();
    expect(t).to.be.instanceof(BaseTx);
  });

  it('should return null on getChildBytes', () => {
    const t = new SendTx();
    // tslint:disable-next-line:no-string-literal no-unused-expression
    expect(t['getChildBytes'](false, false)).to.be.null;
  });

  describe('txs', () => {
    txs.forEach((tx) => {
      describe(`${tx.id}`, () => {
        let genTx: ITransaction<{}>;
        beforeEach(() => {
          genTx = new SendTx()
            .withFees(tx.fee)
            .withAmount(tx.amount)
            .withTimestamp(tx.timestamp)
            // .withRequesterPublicKey(tx.requesterPublicKey)
            .withSenderPublicKey(tx.senderPublicKey)
            .withRecipientId(tx.recipientId)
            .sign(testPrivKey);
        });
        it('should match signature', () => {
          expect(genTx.signature).to.be.deep.eq(tx.signature);
        });
        it('should match id', () => {
          expect(genTx.id).to.be.deep.eq(tx.id);
        });
        it('toString-Obj be eq to genTx', () => {
          expect(genTx).to.be.deep.eq(tx);
        });
        it('toObj should work if signature is set externally', () => {
          const tmpTx = new SendTx()
            .set('fee', tx.fee)
            .set('amount', tx.amount)
            .set('timestamp', tx.timestamp)
            .set('senderPublicKey', tx.senderPublicKey)
            .set('recipientId', tx.recipientId);

          tmpTx.signature = tx.signature;
          expect(tmpTx.toObj()).to.be.deep.eq(tx);
        });
      });

    });
  });

});
