import { expect } from 'chai';
import { rise, TransactionType } from 'risejs';
import { BaseTx, ITransaction } from '../../src/trxTypes/BaseTx';
import { SendTx } from '../../src/trxTypes/Send';
import { testPrivKey, testPubKey } from '../testConsts';
import { createTransactionFromOBJ } from '../../src/utils/txFactory';

// tslint:disable no-var-requires
const txs = [
  require(`${__dirname}/../data/sendTxs.json`)[0],
  require(`${__dirname}/../data/voteTxs.json`)[0],
  require(`${__dirname}/../data/secondSignatureTxs.json`)[0],
  require(`${__dirname}/../data/delegateTxs.json`)[0],
  ];

describe('utils/txFactory', () => {
  describe('txs', () => {
    txs.forEach((tx) => {
      describe(`${tx.id}`, () => {
        it('should clone all the fields correctly', () => {
          const genTx = createTransactionFromOBJ(tx);
          expect(genTx.toObj()).to.be.deep.eq(tx);
        });
      });

    });
  });

});
