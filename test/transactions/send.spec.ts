import {SendTx} from '../../src/trxTypes/Send'
import {rise, TransactionType} from 'risejs';
import {expect} from 'chai';
import {BaseTx, Transaction} from "../../src/trxTypes/BaseTx";
import {testPrivKey, testPubKey} from '../testConsts';
const txs = require(`${__dirname}/../data/sendTxs.json`);

describe('Transactions.send', () => {
  it('should have type 0', () => {
    const t = new SendTx();
    expect(t.type).to.be.deep.eq(TransactionType.SEND);
  });
  it('should inherit from BaseTx', () => {
    const t = new SendTx();
    expect(t).to.be.instanceof(BaseTx)
  });

  it('should return null on getChildBytes', () => {
    const t = new SendTx();
    expect(t['getChildBytes'](false, false)).to.be.null;
  });

  describe('txs', () => {
    txs.forEach(tx => {
      describe('${tx.id}', () => {
        let genTx:Transaction<{}>;
        beforeEach( () => {
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
        })
      });

    });
  });

});
