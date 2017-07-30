import {BaseTx, Transaction} from '../../src/trxTypes/BaseTx'
import { expect } from 'chai';
import { stub } from 'sinon';
import * as proxyquire from 'proxyquire'

const validPrivKey   = 'fa308bd5167d4da15cfb9de0304113be37af8d35585b46ae7213d80fdb57a504904c294899819cce0283d8d351cb10febfa0e9f0acd90a820ec8eb90a7084c37';
const validPublicKey = '904c294899819cce0283d8d351cb10febfa0e9f0acd90a820ec8eb90a7084c37'

class DummyTx extends BaseTx {
  fee: number;
  type: number;


  constructor() {
    super({});
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean) {
    return null;
  }

  protected innerCreate() {

  }

}
// Generatorpublickey for vote txs
// 'wagon stock borrow episode laundry kitten salute link globe zero feed marble'
describe('Transactions.base', () => {
  describe('.sign', () => {
    let t: DummyTx;
    beforeEach(() => t = new DummyTx());
    describe('invalid', () => {
      it('should fail if type is undefined', () => {
        expect(() => t.sign(null, null))
          .to.throw()
      });
      it('should fail if senderPublicKey is undefined', () => {
        t.type = 0;
        expect(() => t.sign(null, null))
          .to.throw()
      });
      it('should fail if timestamp is undefined', () => {
        t.type            = 0;
        t.senderPublicKey = validPublicKey;
        expect(() => t.sign(null, null))
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
        t.sign(validPrivKey, null)
      });

      it('should return an object', () => {
        expect(t.sign(validPrivKey, null)).is.an.instanceof(Object);
      });
    });

    describe('valid', () => {
      let tx:Transaction<{}>;
      beforeEach(() => {
        t
          .set('fee', 1000)
          .set('type',0)
          .set('senderPublicKey', validPublicKey)
          .set('timestamp', 1)
          .set('amount', 10);
        tx = t.sign(validPrivKey)
      });

      it('should be object', () => {
        expect(t).to.be.an.instanceof(Object);
      });
      ['id', 'fee', 'type', 'amount', 'senderPublicKey', 'requesterPublicKey', 'timestamp', 'signature',  'asset']
        .forEach(field => {
          it(`should contain field '${field}'`, () => {
            expect(tx[field]).to.not.be.undefined
          })
        });

      // numeric
      ['type', 'fee', 'timestamp', 'amount']
        .forEach(field => {
          it(`'${field}' should be numeric`, () => {
            expect(typeof(tx[field])).to.be.eq('number');
          });
        });

      // String
      ['senderPublicKey', 'signature', 'id']
        .forEach(field => {
          it(`'${field}' should be a string`, () => {
            expect(typeof(tx[field])).to.be.eq('string');

          });
        });
    });


  });

});