import { expect } from 'chai';
import { TransactionType } from 'risejs';
import { BaseTx, ITransaction, liskifyTx, LiskWallet, SendTx } from '../../src/';
import { testSecondSecret, testSecret, testWallet } from '../testConsts';

// tslint:disable-next-line:no-var-requires
const txs = require(`${__dirname}/../data/sendTxs.withDataField.json`);

describe('Transactions.sendWithDataField', () => {
  it('should have type 0', () => {
    const t = new SendTx({ data: null });
    expect(t.type).to.be.deep.eq(TransactionType.SEND);
  });
  it('should inherit from BaseTx', () => {
    const t = new SendTx({ data: null });
    expect(t).to.be.instanceof(BaseTx);
  });

  it('should return null on getChildBytes when asset is null', () => {
    const t = new SendTx({ data: null });
    // tslint:disable-next-line:no-string-literal no-unused-expression
    expect(t['getChildBytes'](false, false)).to.be.null;
  });

  describe('txs.singlesign', () => {
    txs.single.forEach((tx) => {
      describe(`${tx.id}`, () => {
        let genTx: ITransaction<{}>;
        beforeEach(() => {
          genTx = new SendTx({ data: tx.asset.data } as any)
            .withFees(tx.fee)
            .withAmount(tx.amount)
            .withTimestamp(tx.timestamp)
            .withRecipientId(tx.recipientId)
            .sign(new LiskWallet(testSecret));
        });
        it('should match signature', () => {
          expect(genTx.signature).to.be.deep.eq(tx.signature);
        });
        it('should match id', () => {
          expect(genTx.id).to.be.deep.eq(tx.id);
        });
        it('toString-Obj be eq to genTx', () => {
          expect(liskifyTx(genTx)).to.be.deep.eq(tx);
        });
        it('toObj should work if signature is set externally', () => {
          const tmpTx = new SendTx({ data: tx.asset.data } as any)
            .set('fee', tx.fee)
            .set('amount', tx.amount)
            .set('timestamp', tx.timestamp)
            .set('senderPublicKey', tx.senderPublicKey)
            .set('recipientId', tx.recipientId);

          tmpTx.signature = tx.signature;
          expect(liskifyTx(tmpTx.toObj())).to.be.deep.eq(tx);
        });

        it('should give same result through wallet', () => {
          const unsignedTx = { ...genTx, ... { signature: null } };
          expect(testWallet.signTransaction(unsignedTx)).to
            .be.deep.eq({ ...genTx, senderId: testWallet.address });
        });

        it('should give same result through wallet and basetx obj', () => {
          expect(testWallet.signTransaction(new SendTx({ data: tx.asset.data } as any)
            .withFees(tx.fee)
            .withAmount(tx.amount)
            .withTimestamp(tx.timestamp)
            // .withRequesterPublicKey(tx.requesterPublicKey)
            .withSenderPublicKey(tx.senderPublicKey)
            .withRecipientId(tx.recipientId))).to
            .be.deep.eq({ ...genTx, senderId: testWallet.address });
        });

      });

    });
  });
  describe('txs.secondSign', () => {
    txs.second.forEach((tx) => {
      describe(`${tx.id}`, () => {
        let genTx: ITransaction<{}>;
        beforeEach(() => {
          genTx = new SendTx({ data: tx.asset.data } as any)
            .withFees(tx.fee)
            .withAmount(tx.amount)
            .withTimestamp(tx.timestamp)
            .withRecipientId(tx.recipientId)
            .sign(new LiskWallet(testSecret), new LiskWallet(testSecondSecret).privKey);
        });
        it('should match signature', () => {
          expect(genTx.signature).to.be.deep.eq(tx.signature);
        });
        it('should match id', () => {
          expect(genTx.id).to.be.deep.eq(tx.id);
        });
        it('toString-Obj be eq to genTx', () => {
          expect(liskifyTx(genTx)).to.be.deep.eq(tx);
        });
        it('toObj should work if signature is set externally', () => {
          const tmpTx = new SendTx({ data: tx.asset.data } as any)
            .set('fee', tx.fee)
            .set('amount', tx.amount)
            .set('timestamp', tx.timestamp)
            .set('senderPublicKey', tx.senderPublicKey)
            .set('recipientId', tx.recipientId);

          tmpTx.signature     = tx.signature;
          tmpTx.signSignature = tx.signSignature;
          expect(liskifyTx(tmpTx.toObj())).to.be.deep.eq(tx);
        });

        it('should give same result through wallet', () => {
          const unsignedTx = { ...genTx, ... { signature: null } };
          expect(testWallet.signTransaction(unsignedTx, new LiskWallet(testSecondSecret))).to
            .be.deep.eq({ ...genTx, senderId: testWallet.address });
        });

        it('should give same result through wallet and basetx obj', () => {
          expect(testWallet.signTransaction(new SendTx({ data: tx.asset.data } as any)
            .withFees(tx.fee)
            .withAmount(tx.amount)
            .withTimestamp(tx.timestamp)
            // .withRequesterPublicKey(tx.requesterPublicKey)
            .withSenderPublicKey(tx.senderPublicKey)
            .withRecipientId(tx.recipientId), new LiskWallet(testSecondSecret)))
            .to
            .be.deep.eq({ ...genTx, senderId: testWallet.address });
        });

      });

    });
  });

});
