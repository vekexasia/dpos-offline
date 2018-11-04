import { expect } from 'chai';
import { IRegisterDelegateTx, ISendTx, IVoteTx, Lisk, RecipientId } from '../../src/codecs';
import { As } from 'type-tagger';
import { testSecondSecret, testSecret } from '../testConsts';

describe('lisk.codec', () => {

  describe('messages', () => {
    it('should sign and verify message', () => {
      let kp          = Lisk.deriveKeypair(testSecret);
      const signature = Lisk.msgs.sign('hey', kp);
      expect(Lisk.msgs.verify('hey', signature, kp.publicKey)).is.true;
    });
    it('should verify external message', () => {
      const msg       = 'mdlqubtltnopveeooqineokmvkbgesuqkbshlerdoqupqlcqctgtsrhmeqckekvpvoidvnkbovkhbkqhiusmodfgrisrdpngnmnvqqfegtsuiinrnrijrgfmcenbutbuftlqkugvnjqcfrilcpdtuspbjithobuepgnmqgdlmfjedvlerdeqrfciqqpmjdkrqhpjvkrrgdfpusbvunignjhiqtuprvtmmvudlnfoguukcdjpqvvcnidpqlubfqjurhdircopelgdpviqpibhdiqsbdlqldnfukopsetvfpcnvefdprnbfgnbjhiesseguvrudtpppiemhvoeodbclmoqcrriqojvelqplbejogkfuklvnftbhrcljrglndquitpkjdfgjkqffstdjgbjtqcmiiehoviukdlpjkngcbjlsggtslfhcurjfpnqpenkpldsmvcloudttqdikktpfopeqpfijhrvofmnpotekkeefqvudvknltcqcrbgrrbtmngjjqloqfdpdhhqmoccqsvjulurlpqfuqotjmrtsinotmrfdrtrjpeqrbgrfekisibeovkgdvurvcufqoeklmdngntebbdbfhgdnhgonfovefupebntlouroonflgfvcjbrqingblqnubmbqonbidtphddhurccievufeqscehvegcffddpnfogsfcppmervrbtjsidsufchoivdbpqoucdpjksbeeknmhtqpodmhufursmjhrdiojfsirbfgtctqcmlmuknemjiuncqufopobbpcncqfuveqgljpfvhrgkfbpodkslnmgdsejridfvhkficgpkoghdoiofckesurbhlmprchjlsbpivfhjhfdjtuudeurflbhgkptuveibdnsrfqtiiktfgikrqgvtdjvpfbifesqjkigtfpeophdnloisgrgudjtnpejhbvfehrckhgjgmovsnbq';
      const pubKey    = Buffer.from('b1eff567b8e80371b32846ee9f35aaffc82d3ea1f850d87a7a0248e9b2ec6926', 'hex') as Buffer & As<'publicKey'>;
      const signature = Buffer.from('ec47a41a0877e811e7511d6136bc01d04386bebe5fd7c76bddacb7f6094a2a195480a1af6c648701dc6ab1a6ed4a7858fc82665b2c41babcdb0d1ab5635a6208', 'hex') as Buffer & As<'signature'>;
      expect(Lisk.msgs.verify(msg, signature, pubKey)).is.true;
      expect(Lisk.msgs.verify(msg + 'a', signature, pubKey)).is.false;
    });
  });
  describe('wallet address derivation', () => {
    const wallets = require(`${__dirname}/../data/wallets.json`);
    wallets.forEach((w) => {
      describe(`Wallet ${w.address}`, () => {
        it('will derive publicKey properly', () => {
          expect(Lisk.deriveKeypair(w.secret).publicKey.toString('hex')).eq(w.publicKey);
          expect(Lisk.deriveKeypair(Buffer.from(w.secret, 'utf8')).publicKey.toString('hex')).eq(w.publicKey);
        });
        it('will derive address properly', () => {
          expect(Lisk.calcAddress(Lisk.deriveKeypair(w.secret).publicKey)).eq(w.address);
        });
      });
    });
  });
  describe('send', () => {
    const sendObj: ISendTx = {
      sender   : Lisk.deriveKeypair(testSecret),
      kind     : 'send',
      amount   : '10',
      memo     : 'heyho',
      recipient: '1L' as RecipientId,
    };
    it('transforms, sign and verify properly', () => {
      const t = Lisk.txs.transform(sendObj);
      expect(t.type).eq(0);
      expect(t.amount).eq(10);
      expect(t.timestamp).gt(0);
      expect(t.asset).deep.eq({
        data: 'heyho',
      });
      expect(t.fee).eq(10000000);
      const signedTx = Lisk.txs.sign(t, testSecret);
      expect(Lisk.txs.verify(signedTx));
    });

    describe('realtxs', () => {
      describe('without memo', () => {
        const txs = require(`${__dirname}/../data/sendTxs.json`);
        txs.forEach((tx) => {
          describe(`TX ${tx.id}`, () => {
            it('should convert from postable (and back) properly', () => {
              const fp = Lisk.txs.fromPostable(tx);
              const tp = Lisk.txs.toPostable(fp);
              expect(tp).deep.eq(tx);
            });
            it('should sign the same', () => {
              let fp         = Lisk.txs.fromPostable(tx);
              fp.signature   = null;
              fp.id          = null;
              fp             = Lisk.txs.sign(fp, testSecret);
              const postable = Lisk.txs.toPostable(fp);
              expect(postable).deep.eq(tx);
            });
          });
        });
        const ssTxs = require(`${__dirname}/../data/secondSignatureTxs.json`);
        ssTxs.forEach(({ secret, secondSecret, tx }) => {
          it(`SS TX: ${tx.id} should secondsign properly `, () => {
            const fp = Lisk.txs.fromPostable(tx);
            delete fp.signature;
            delete fp.signSignature;

            const stx         = Lisk.txs.sign(fp, secret);
            stx.signSignature = Lisk.txs.calcSignature(fp, Lisk.deriveKeypair(secondSecret));

            const postable = Lisk.txs.toPostable(stx);
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
                const fp = Lisk.txs.fromPostable(tx);
                const tp = Lisk.txs.toPostable(fp);
                expect(tp).deep.eq(tx);
              });
              it('should sign the same', () => {
                let fp         = Lisk.txs.fromPostable(tx);
                fp.signature   = null;
                fp.id          = null;
                fp             = Lisk.txs.sign(fp, Lisk.deriveKeypair(testSecret));
                const postable = Lisk.txs.toPostable(fp);
                expect(postable).deep.eq(tx);
              });
            });
          });
        });
        describe('secondSign', () => {
          txs.second.forEach((tx) => {
            describe(`TX ${tx.id}`, () => {
              it('should convert from postable (and back) properly', () => {
                const fp = Lisk.txs.fromPostable(tx);
                const tp = Lisk.txs.toPostable(fp);
                expect(tp).deep.eq(tx);
              });
              it('should sign the same', () => {
                let fp           = Lisk.txs.fromPostable(tx);
                fp.signature     = null;
                fp.id            = null;
                fp.signSignature = null;
                fp               = Lisk.txs.sign(fp, Lisk.deriveKeypair(testSecret));
                fp.signSignature = Lisk.txs.calcSignature(fp, Lisk.deriveKeypair(testSecondSecret));
                const postable   = Lisk.txs.toPostable(fp);
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
      sender     : Lisk.deriveKeypair(testSecret),
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
      const t = Lisk.txs.transform(voteObj);
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
      const tmp = Lisk.txs.createAndSign(
        { ...voteObj, sender: null },
        Lisk.deriveKeypair(testSecret),
        true
      );
      expect(tmp.senderPublicKey).deep.eq(Lisk.deriveKeypair(testSecret).publicKey);
      expect(Lisk.txs.verify(tmp)).is.true;
    });
    it('with sender and in postable format', () => {
      const tmp = Lisk.txs.createAndSign(
        { ...voteObj, sender: { publicKey: Lisk.deriveKeypair(testSecret).publicKey } },
        Lisk.deriveKeypair(testSecret)
      );
      expect(tmp.senderPublicKey).deep.eq(Lisk.deriveKeypair(testSecret).publicKey.toString('hex'));
      expect(Lisk.txs.verify(Lisk.txs.fromPostable(tmp))).is.true;
    });

    describe('realtxs', () => {
      const txs = require(`${__dirname}/../data/voteTxs.json`);
      txs.forEach((tx) => {
        describe(`TX ${tx.id}`, () => {
          it('should convert from postable (and back) properly', () => {
            const fp = Lisk.txs.fromPostable(tx);
            const tp = Lisk.txs.toPostable(fp);
            expect(tp).deep.eq(tx);
          });
          it('should sign the same', () => {
            let fp         = Lisk.txs.fromPostable(tx);
            fp.signature   = null;
            fp.id          = null;
            fp             = Lisk.txs.sign(fp, Lisk.deriveKeypair(testSecret));
            const postable = Lisk.txs.toPostable(fp);
            expect(postable).deep.eq(tx);
          });
        });
      });
    });
  });
  describe('delegate registration', () => {
    const voteObj: IRegisterDelegateTx = {
      sender    : Lisk.deriveKeypair(testSecret),
      kind      : 'register-delegate',
      identifier: 'vekexasia' as string & As<'delegateName'>,
    };
    it('transforms properly', () => {
      const t = Lisk.txs.transform(voteObj);
      expect(t.amount).eq(0);
      expect(t.timestamp).gt(0);
      expect(t.asset).deep.eq({
        delegate: { username: 'vekexasia' },
      });
      expect(t.fee).eq(2500000000);
    });
    const delegates = require(`${__dirname}/../data/genesisDelegates.json`).delegates;
    const txs       = require(`${__dirname}/../data/delegateTxs.json`);
    txs.forEach((t) => {
      it(`Tx: ${t.id} should sign and transform properly`, () => {
        const tx = Lisk.txs.fromPostable(t);
        delete tx.signature;
        const signed = Lisk.txs.sign(tx, delegates.find((a) => a.username === tx.asset.delegate.username).secret);
        expect(Lisk.txs.toPostable(signed)).deep.eq(t);
      });
    });
  });
});