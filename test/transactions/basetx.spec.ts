import { BaseTx } from '../../src/trxTypes/BaseTx';
import { expect } from 'chai';
import { stub } from 'sinon';

const validPrivKey   = 'fa308bd5167d4da15cfb9de0304113be37af8d35585b46ae7213d80fdb57a504904c294899819cce0283d8d351cb10febfa0e9f0acd90a820ec8eb90a7084c37';
const validPublicKey = '904c294899819cce0283d8d351cb10febfa0e9f0acd90a820ec8eb90a7084c37'

class DummyTx extends BaseTx {
  fee: number;
  type: number;

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean) {
    return null;
  }

  protected innerCreate() {

  }

}
// Generatorpublickey for vote txs
// 'wagon stock borrow episode laundry kitten salute link globe zero feed marble'
describe('Transactions.base', () => {
  describe('.create', () => {
    let t: BaseTx;
    beforeEach(() => t = new DummyTx());
    describe('invalid', () => {
      it('should fail if type is undefined', () => {
        expect(() => t.create(null, null))
          .to.throw()
      });
      it('should fail if senderPublicKey is undefined', () => {
        t.type = 0;
        expect(() => t.create(null, null))
          .to.throw()
      });
      it('should fail if timestamp is undefined', () => {
        t.type            = 0;
        t.senderPublicKey = validPublicKey;
        expect(() => t.create(null, null))
          .to.throw()
      });
    });
    describe('valid', () => {
      beforeEach(() => {
        t.type            = 0;
        t.senderPublicKey = validPublicKey;
        t.timestamp       = 1;
        t.amount          = 10;
      });
      it('should not fail if timestamp is >0', () => {
        t.create(validPrivKey, null)
      });

      it('should return an instance of DummyTx', () => {
        expect(t.create(validPrivKey, null)).is.an.instanceof(DummyTx);
      });
    });
  });
  describe('.toString()', () => {
    let t: BaseTx;
    beforeEach(() => {
      t                 = new DummyTx();
      t.fee             = 10;
      t.type            = 0;
      t.senderPublicKey = validPublicKey;
      t.timestamp       = 1;
      t.amount          = 10;
    });
    it('should fail if not signed', () => {
      expect(() => t.toString()).to.throw();
    });
    describe('valid', () => {
      beforeEach(() => t.create(validPrivKey));
      it('should not fail if signed', () => {
        expect(t.toString()).is.string('')
      });
      it('should be valid JSON', () => {
        expect(() => JSON.parse(t.toString())).to.not.throw();
      });
      ['id', 'fee', 'type', 'amount', 'senderPublicKey', 'requesterPublicKey', 'timestamp', 'signature', 'secondSignature', 'asset']
        .forEach(field => {
          it(`should contain field '${field}'`, () => {
            const tx = JSON.parse(t.toString());
            expect(tx[field]).to.not.be.undefined
          })
        });

      // numeric
      ['type', 'fee', 'timestamp', 'amount']
        .forEach(field => {
          it(`'${field}' should be numeric`, () => {
            const tx = JSON.parse(t.toString());
            expect(typeof(tx[field])).to.be.eq('number');
          });
        });

      // String
      ['senderPublicKey', 'signature', 'id']
        .forEach(field => {
          it(`'${field}' should be a string`, () => {
            const tx = JSON.parse(t.toString());
            expect(typeof(tx[field])).to.be.eq('string');
          });
        });
    });


    describe('against real test cases', () => {

    });

  });
});