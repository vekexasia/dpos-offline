import {expect} from 'chai';
import {TransactionType} from 'risejs';
import {LiskWallet} from '../../src/liskWallet';
import {BaseTx, ITransaction} from '../../src/trxTypes/BaseTx';
import {DelegateTx, IDelegateTxAsset} from '../../src/trxTypes/Delegate';
// tslint:disable-next-line no-var-requires
const genesisDelegates = require(`${__dirname}/../data/genesisDelegates.json`).delegates;
// tslint:disable-next-line no-var-requires
const txs              = require(`${__dirname}/../data/delegateTxs.json`);

describe('Transactions.delegate', () => {
  it('should have type 2', () => {
    const t = new DelegateTx();
    expect(t.type).to.be.deep.eq(TransactionType.DELEGATE);
  });
  it('should inherit from BaseTx', () => {
    const t = new DelegateTx();
    expect(t).to.be.instanceof(BaseTx);
  });

  it('should return null on getChildBytes if votes is undefined', () => {
    const t = new DelegateTx();
    // tslint:disable-next-line no-string-literal no-unused-expression
    expect(t['getChildBytes'](false, false)).to.be.null;
  });

  describe('txs', () => {
    txs.forEach((tx) => {
      describe(`${tx.id}`, () => {
        let t: DelegateTx;
        let signedTx: ITransaction<IDelegateTxAsset>;
        beforeEach(() => {
          t                    = new DelegateTx(tx.asset);
          t
            .withFees(tx.fee)
            .withTimestamp(tx.timestamp)
            .withRequesterPublicKey(tx.requesterPublicKey)
            .withSenderPublicKey(tx.senderPublicKey)
            .withRecipientId(tx.recipientId);

          const delegate = genesisDelegates
            .filter((gd) => gd.username === tx.asset.delegate.username)[0];
          const wallet = new LiskWallet(delegate.secret);
          signedTx = t.sign(wallet.privKey);
        });
        it('should match signature', () => {
          expect(signedTx.signature).to.be.deep.eq(tx.signature);
        });
        it('should match id', () => {
          expect(signedTx.id).to.be.deep.eq(tx.id);
        });
        it('toString-Obj be eq to tx', () => {
          expect(signedTx).to.be.deep.eq(tx);
        });
      });

    });
  });

});
