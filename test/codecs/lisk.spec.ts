import { expect } from 'chai';
import { IRegisterDelegateTx, ISendTx, IVoteTx, LiskCodec, RecipientId } from '../../src/codecs';
import { As } from 'type-tagger';
import { testSecondSecret, testSecret } from '../testConsts';

describe('lisk.codec', () => {
  describe('wallet address derivation', () => {
    const wallets = require(`${__dirname}/../data/wallets.json`);
    wallets.forEach((w) => {
      describe(`Wallet ${w.address}`, () => {
        it('will derive publicKey properly', () => {
          expect(LiskCodec.deriveKeypair(w.secret).publicKey.toString('hex')).eq(w.publicKey);
          expect(LiskCodec.deriveKeypair(Buffer.from(w.secret, 'utf8')).publicKey.toString('hex')).eq(w.publicKey);
        });
        it('will derive address properly', () => {
          expect(LiskCodec.calcAddress(LiskCodec.deriveKeypair(w.secret).publicKey)).eq(w.address);
        });
      });
    });
  });
  describe('send', () => {
    const sendObj: ISendTx = {
      sender   : LiskCodec.deriveKeypair(testSecret),
      kind     : 'send',
      amount   : '10',
      memo     : 'heyho',
      recipient: '1L' as RecipientId,
    };
    it('transforms, sign and verify properly', () => {
      const t = LiskCodec.txs.transform(sendObj);
      expect(t.type).eq(0);
      expect(t.amount).eq(10);
      expect(t.timestamp).gt(0);
      expect(t.asset).deep.eq({
        data: 'heyho',
      });
      expect(t.fee).eq(10000000);
      const signedTx = LiskCodec.txs.sign(t, testSecret);
      expect(LiskCodec.txs.verify(signedTx));
    });

    describe('realtxs', () => {
      describe('without memo', () => {
        const txs = require(`${__dirname}/../data/sendTxs.json`);
        txs.forEach((tx) => {
          describe(`TX ${tx.id}`, () => {
            it('should convert from postable (and back) properly', () => {
              const fp = LiskCodec.txs.fromPostable(tx);
              const tp = LiskCodec.txs.toPostable(fp);
              expect(tp).deep.eq(tx);
            });
            it('should sign the same', () => {
              let fp         = LiskCodec.txs.fromPostable(tx);
              fp.signature   = null;
              fp.id          = null;
              fp             = LiskCodec.txs.sign(fp, testSecret);
              const postable = LiskCodec.txs.toPostable(fp);
              expect(postable).deep.eq(tx);
            });
          });
        });
        const ssTxs = require(`${__dirname}/../data/secondSignatureTxs.json`);
        ssTxs.forEach(({secret, secondSecret, tx}) => {
          it(`SS TX: ${tx.id} should secondsign properly `, () => {
            const fp = LiskCodec.txs.fromPostable(tx);
            delete fp.signature;
            delete fp.signSignature;

            const stx = LiskCodec.txs.sign(fp, secret);
            stx.signSignature = LiskCodec.txs.calcSignature(fp, LiskCodec.deriveKeypair(secondSecret));

            const postable = LiskCodec.txs.toPostable(stx);
            expect(postable).deep.eq(tx);
          });
        });
      });
      describe('with memo', () => {
        const txs = require(`${__dirname}/../data/sendTxs.withDataField.json`);
        describe('singleSign', () => {
          txs.single.forEach((tx) => {
            describe(`TX ${tx.id}`, () => {
              it('should convert from postable (and back) properly', () => {
                const fp = LiskCodec.txs.fromPostable(tx);
                const tp = LiskCodec.txs.toPostable(fp);
                expect(tp).deep.eq(tx);
              });
              it('should sign the same', () => {
                let fp         = LiskCodec.txs.fromPostable(tx);
                fp.signature   = null;
                fp.id          = null;
                fp             = LiskCodec.txs.sign(fp, LiskCodec.deriveKeypair(testSecret));
                const postable = LiskCodec.txs.toPostable(fp);
                expect(postable).deep.eq(tx);
              });
            });
          });
        });
        describe('secondSign', () => {
          txs.second.forEach((tx) => {
            describe(`TX ${tx.id}`, () => {
              it('should convert from postable (and back) properly', () => {
                const fp = LiskCodec.txs.fromPostable(tx);
                const tp = LiskCodec.txs.toPostable(fp);
                expect(tp).deep.eq(tx);
              });
              it('should sign the same', () => {
                let fp         = LiskCodec.txs.fromPostable(tx);
                fp.signature = null;
                fp.id          = null;
                fp.signSignature = null;
                fp = LiskCodec.txs.sign(fp, LiskCodec.deriveKeypair(testSecret));
                fp.signSignature = LiskCodec.txs.calcSignature(fp, LiskCodec.deriveKeypair(testSecondSecret));
                const postable = LiskCodec.txs.toPostable(fp);
                expect(postable).deep.eq(tx);
              });
            });
          });
        });
      });

    });
  });
  describe('votes', () => {
    const voteObj: IVoteTx = {
      sender     : LiskCodec.deriveKeypair(testSecret),
      kind       : 'vote',
      preferences: [
        {
          action            : '+',
          delegateIdentifier: Buffer.alloc(32).fill(0xaa) as Buffer & As<'publicKey'>,
        },
        {
          action            : '-',
          delegateIdentifier: Buffer.alloc(32).fill(0xbb) as Buffer & As<'publicKey'>,
        },
      ],
    };
    it('transforms properly', () => {
      const t = LiskCodec.txs.transform(voteObj);
      expect(t.amount).eq(0);
      expect(t.timestamp).gt(0);
      expect(t.asset).deep.eq({
        votes: [
          `+${new Array(64).fill('a').join('')}`,
          `-${new Array(64).fill('b').join('')}`,
        ],
      });
      expect(t.fee).eq(100000000);

    });
    it('without Sender', () => {
      const tmp = LiskCodec.txs.createAndSign(
        { ...voteObj, sender: null },
        LiskCodec.deriveKeypair(testSecret)
      );
      expect(tmp.senderPublicKey).deep.eq(LiskCodec.deriveKeypair(testSecret).publicKey);
      expect(LiskCodec.txs.verify(tmp)).is.true;
    });
    it('with sender', () => {
      const tmp = LiskCodec.txs.createAndSign(
        { ...voteObj, sender: { publicKey: LiskCodec.deriveKeypair(testSecret).publicKey } },
        LiskCodec.deriveKeypair(testSecret)
      );
      expect(tmp.senderPublicKey).deep.eq(LiskCodec.deriveKeypair(testSecret).publicKey);
      expect(LiskCodec.txs.verify(tmp)).is.true;
    });

    describe('realtxs', () => {
      const txs = require(`${__dirname}/../data/voteTxs.json`);
      txs.forEach((tx) => {
        describe(`TX ${tx.id}`, () => {
          it('should convert from postable (and back) properly', () => {
            const fp = LiskCodec.txs.fromPostable(tx);
            const tp = LiskCodec.txs.toPostable(fp);
            expect(tp).deep.eq(tx);
          });
          it('should sign the same', () => {
            let fp         = LiskCodec.txs.fromPostable(tx);
            fp.signature   = null;
            fp.id          = null;
            fp             = LiskCodec.txs.sign(fp, LiskCodec.deriveKeypair(testSecret));
            const postable = LiskCodec.txs.toPostable(fp);
            expect(postable).deep.eq(tx);
          });
        });
      });
    });
  });
  describe('delegate registration', () => {
    const voteObj: IRegisterDelegateTx = {
      sender     : LiskCodec.deriveKeypair(testSecret),
      kind       : 'register-delegate',
      name       : 'vekexasia' as string & As<'delegateName'>,
    };
    it('transforms properly', () => {
      const t = LiskCodec.txs.transform(voteObj);
      expect(t.amount).eq(0);
      expect(t.timestamp).gt(0);
      expect(t.asset).deep.eq({
        delegate: { username: 'vekexasia'},
      });
      expect(t.fee).eq(2500000000);
    });
    const delegates = require(`${__dirname}/../data/genesisDelegates.json`).delegates;
    const txs = require(`${__dirname}/../data/delegateTxs.json`);
    txs.forEach((t) => {
      it(`Tx: ${t.id} should sign and transform properly`, () => {
        const tx = LiskCodec.txs.fromPostable(t);
        delete tx.signature;
        const signed = LiskCodec.txs.sign(tx, delegates.find((a) => a.username === tx.asset.delegate.username).secret);
        expect(LiskCodec.txs.toPostable(signed)).deep.eq(t);
      });
    });
  });
});