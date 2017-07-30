import {DelegateTx, DelegateTxAsset} from '../../src/trxTypes/Delegate'
import {TransactionType} from 'risejs';
import {expect} from 'chai';
import {BaseTx, Transaction} from "../../src/trxTypes/BaseTx";
import {LiskWallet} from '../../src/liskWallet';

const genesisDelegates = require(`${__dirname}/../data/genesisDelegates.json`).delegates;
const txs              = require(`${__dirname}/../data/delegateTxs.json`);

describe('Transactions.delegate', () => {
  it('should have type 2', () => {
    const t = new DelegateTx();
    expect(t.type).to.be.deep.eq(TransactionType.DELEGATE);
  });
  it('should inherit from BaseTx', () => {
    const t = new DelegateTx();
    expect(t).to.be.instanceof(BaseTx)
  });


  it('should return null on getChildBytes if votes is undefined', () => {
    const t = new DelegateTx();
    expect(t['getChildBytes'](false, false)).to.be.null;
  });

  describe('txs', () => {
    txs.forEach(tx => {
      describe(`${tx.id}`, () => {
        let t: DelegateTx;
        let signedTx: Transaction<DelegateTxAsset>;
        beforeEach(() => {
          t                    = new DelegateTx(tx.asset);
          t
            .withFees(tx.fee)
            .withTimestamp(tx.timestamp)
            .withRequesterPublicKey(tx.requesterPublicKey)
            .withSenderPublicKey(tx.senderPublicKey)
            .withRecipientId(tx.recipientId);

          let delegate = genesisDelegates.filter(gd => gd.username == tx.asset.delegate.username)[0];
          const wallet = new LiskWallet(delegate.secret);
          signedTx = t.sign(wallet.privKey);
        });
        it(`should match signature`, () => {
          expect(signedTx.signature).to.be.deep.eq(tx.signature);
        });
        it('should match id', () => {
          expect(signedTx.id).to.be.deep.eq(tx.id);
        });
        it('toString-Obj be eq to tx', () => {
          expect(signedTx).to.be.deep.eq(tx);
        })
      });

    });
  });

});