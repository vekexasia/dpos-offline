import { expect } from 'chai';
import { BaseTx, ITransaction } from '../../src/trxTypes/BaseTx';
import {LiskWallet} from '../../src/liskWallet';

// tslint:disable-next-line max-line-length
const validPrivKey   = 'fa308bd5167d4da15cfb9de0304113be37af8d35585b46ae7213d80fdb57a504904c294899819cce0283d8d351cb10febfa0e9f0acd90a820ec8eb90a7084c37';
const validPublicKey = '904c294899819cce0283d8d351cb10febfa0e9f0acd90a820ec8eb90a7084c37';

class DummyTx extends BaseTx {
  public fee: number;
  public type: number;

  constructor() {
    super({});
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean) {
    return null;
  }
}

// Generatorpublickey for vote txs
// 'wagon stock borrow episode laundry kitten salute link globe zero feed marble'
describe('Transactions.base', () => {
  describe('.sign', () => {
    let t: DummyTx;
    beforeEach(() => t = new DummyTx());
    describe('invalid', () => {
      beforeEach(() => {
        t.type            = 0;
        t.senderPublicKey = validPublicKey;
        t.timestamp       = 1;
        t.amount          = 10;
        t.fee             = 10;
      });
      it('should fail if type is undefined', () => {
        delete t.type;
        expect(() => t.sign(null, null))
          .to.throw(/Unknown transaction type/);
      });
      it('should fail if senderPublicKey is undefined', () => {
        delete t.senderPublicKey;
        expect(() => t.sign(null, null))
          .to.throw(/Sender Public Key is empty/);
      });
      it('should fail if timestamp is undefined', () => {
        delete t.timestamp;
        expect(() => t.sign(null, null))
          .to.throw(/Invalid timestamp provided/);
      });
      it('should fail if timestamp is less than zero', () => {
        t.set('timestamp', -1);
        expect(() => t.sign(null, null))
          .to.throw(/Invalid timestamp provided/);
      });
    });
    describe('valid', () => {
      beforeEach(() => {
        t.type            = 0;
        t.senderPublicKey = validPublicKey;
        t.timestamp       = 1;
        t.amount          = 10;
        t.fee             = 10;
      });
      it('should not fail if timestamp is >0', () => {
        t.sign(validPrivKey, null);
      });

      it('should not fail with timestamp 0', () => {
        t.set('timestamp', 0);
        t.sign(validPrivKey, null);
      });

      it('should return an object', () => {
        expect(t.sign(validPrivKey, null)).is.an.instanceof(Object);
      });

      it('should use wallet public key if sign is provided with a wallet', () => {
        delete t.senderPublicKey;
        const liskWallet = new LiskWallet('one two three', 'L');
        const tx = t.sign(liskWallet);
        expect(tx.senderPublicKey).to.be.deep.eq(liskWallet.publicKey);
        // tslint:disable-next-line no-unused-expression
        expect(tx.signSignature).to.not.exist;
      });

      it('should use secondsign if provided', () => {
        delete t.senderPublicKey;
        const liskWallet = new LiskWallet('one two three', 'L');
        // Just for privkey derivation
        const liskWallet2 = new LiskWallet('one two three 4', 'L');
        const tx = t.sign(liskWallet, liskWallet2.privKey);
        expect(tx.senderPublicKey).to.be.deep.eq(liskWallet.publicKey);
        // tslint:disable-next-line no-unused-expression
        expect(tx.signSignature).to.exist;
      });
    });

    describe('base valid', () => {
      let tx: ITransaction<{}>;
      beforeEach(() => {
        t
          .set('fee', 1000)
          .set('type', 0)
          .set('senderPublicKey', validPublicKey)
          .set('timestamp', 1)
          .set('amount', 10);
        tx = t.sign(validPrivKey);
      });

      it('should be object', () => {
        expect(t).to.be.an.instanceof(Object);
      });
      ['id', 'fee', 'type', 'amount', 'senderPublicKey', 'requesterPublicKey', 'timestamp', 'signature', 'asset']
        .forEach((field) => {
          it(`should contain field '${field}'`, () => {
            // tslint:disable-next-line no-unused-expression
            expect(tx[field]).to.not.be.undefined;
          });
        });

      // numeric
      ['type', 'fee', 'timestamp', 'amount']
        .forEach((field) => {
          it(`'${field}' should be numeric`, () => {
            expect(typeof(tx[field])).to.be.eq('number');
          });
        });

      // String
      ['senderPublicKey', 'signature', 'id']
        .forEach((field) => {
          it(`'${field}' should be a string`, () => {
            expect(typeof(tx[field])).to.be.eq('string');

          });
        });
    });
  });
});
