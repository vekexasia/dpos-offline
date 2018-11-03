import { expect } from 'chai';
import { testSecret } from '../testConsts';
import { LiskCodec, LiskTransaction, RecipientId, RiseCodec } from '../../src/codecs';
import { As } from 'type-tagger';

// tslint:disable-next-line:no-var-requires
const txs = require(`${__dirname}/../data/sendTxs.json`);

describe('Transactions.send', () => {
  describe(' Lisk txs', () => {
    txs.forEach((tx) => {
      describe(`${tx.id}`, () => {
        let genTx: LiskTransaction<void>;
        beforeEach(() => {
          genTx = {
            ...tx,
            id             : null,
            senderPublicKey: Buffer.from(tx.senderPublicKey, 'hex'),
            signature      : null,
          };
        });
        it('should match signature', () => {
          let signature = LiskCodec.txs.calcSignature(genTx, LiskCodec.deriveKeypair(testSecret));
          expect(signature).to.be.deep.eq(Buffer.from(tx.signature, 'hex'));
        });
        it('should match id after sign', () => {
          genTx = LiskCodec.txs.sign(genTx, LiskCodec.deriveKeypair(testSecret));
          const id = LiskCodec.txs.identifier(genTx);
          expect(id).to.be.deep.eq(tx.id);
        });
        it('postableData-Obj be eq to genTx', () => {
          genTx = LiskCodec.txs.postableData(
            LiskCodec.txs.sign(genTx, LiskCodec.deriveKeypair(testSecret))
          );
          delete tx.requesterPublicKey;
          expect(genTx).to.be.deep.eq({
            ...tx, asset: {},
            amount      : `${tx.amount}`,
            fee         : `${tx.fee}`,
          });
        });
      });

    });
  });
  describe('RISE txs', () => {
    txs.forEach((tx) => {
      describe(`${tx.id}`, () => {
        let genTx: LiskTransaction<void>;
        beforeEach(() => {
          genTx = {
            ...tx,
            id             : null,
            senderPublicKey: Buffer.from(tx.senderPublicKey, 'hex'),
            signature      : null,
          };
        });
        it('should match signature', () => {
          let signature = RiseCodec.txs.calcSignature(genTx, RiseCodec.deriveKeypair(testSecret));
          expect(signature).to.be.deep.eq(Buffer.from(tx.signature, 'hex'));
        });
        it('should match id after sign', () => {
          genTx = RiseCodec.txs.sign(genTx, RiseCodec.deriveKeypair(testSecret));
          const id = RiseCodec.txs.identifier(genTx);
          expect(id).to.be.deep.eq(tx.id);
        });
        it('postableData-Obj be eq to genTx with numeric amounts', () => {
          genTx = RiseCodec.txs.postableData(
            RiseCodec.txs.sign(genTx, RiseCodec.deriveKeypair(testSecret))
          );
          delete tx.requesterPublicKey;
          expect(genTx).to.be.deep.eq({
            ...tx, asset: {},
            senderId: RiseCodec.calcAddress(RiseCodec.deriveKeypair(testSecret).publicKey),
          });
        });
      });

    });
  });

  describe('creation', () => {
    it('should create a send transaction properly', () => {
      const t = LiskCodec.txs.transform({
        kind: 'send',
        recipient: '1L' as RecipientId,
        amount: '13',
        sender: LiskCodec.deriveKeypair(testSecret),
      });
      console.log(t);
    });
  });

});
