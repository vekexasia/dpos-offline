import { expect } from 'chai';
import { createTransactionFromOBJ } from '../../src/utils/txFactory';

// tslint:disable no-var-requires
const txs = [
  ... require(`${__dirname}/../data/sendTxs.json`),
  ... require(`${__dirname}/../data/voteTxs.json`),
  require(`${__dirname}/../data/secondSignatureTxs.json`)[0].tx,
  ... require(`${__dirname}/../data/delegateTxs.json`),
];

describe('utils/txFactory', () => {
  describe('txs', () => {
    txs.forEach((tx, idx) => {
      describe(`${tx.id} - ${idx}`, () => {
        it('should clone all the fields correctly', () => {
          tx = {... {requesterPublicKey: null}, ...tx};
          const genTx = createTransactionFromOBJ(tx);
          expect(genTx.toObj()).to.be.deep.eq({...tx, senderId: null});
        });
      });
    });
  });
  it('should fail if tx is of unknown type', () => {
    const clonedTx = createTransactionFromOBJ(txs[0]).toObj();
    clonedTx.type = 10;
    expect(() => createTransactionFromOBJ(clonedTx)).to.throw('Transaction 10 is not supported');
  });

});
