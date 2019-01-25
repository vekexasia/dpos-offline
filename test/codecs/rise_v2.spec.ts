import { expect } from 'chai';
import { Address, Lisk, Rise, RiseV2 } from '../../src/codecs';
import * as bech32 from 'bech32';
import { toSha256 } from '../../src/utils/sha256';
import { testSecret } from '../testConsts';
import { As } from 'type-tagger';

const acct = RiseV2.deriveKeypair('meow');

describe('risev2.codec', () => {
  describe('wallet address derivation', () => {
    const wallets = require(`${__dirname}/../data/wallets.json`);
    wallets.forEach((w) => {
      describe(`Wallet ${w.address}`, () => {
        it('will derive address properly', () => {
          expect(RiseV2.deriveKeypair(w.secret).publicKey).deep.eq(Buffer.from(w.publicKey, 'hex'));

          const address = RiseV2.calcAddress(RiseV2.deriveKeypair(w.secret).publicKey);

          // check against proper bech32 impl.
          const doubleSHA = toSha256(toSha256(Buffer.from(w.publicKey, 'hex')));
          expect(address).eq(
            bech32.encode(
              'rise',
              bech32.toWords(Buffer.concat([new Buffer([1]), doubleSHA]))
            )
          );

        });
      });
    });
  });

  describe('send', () => {
    describe('real cases', () => {
      const txs = require(`${__dirname}/../data/sendTxs.json`);
      txs.forEach((tx) => {
        describe(`TX ${tx.id}`, () => {
          it('should sign the same as RiseV1', () => {
            const fp         = Rise.txs.fromPostable(tx);
            const copy = {...fp};
            fp.signature   = null;
            fp.id          = null;
            let converted  = RiseV2.txs.fromV1Format(fp);
            converted      = RiseV2.txs.sign(converted, testSecret);
            expect(converted.id).eq(copy.id);
            expect(converted.signatures).deep.eq([
              copy.signature,
            ]);

            // Test without senderPubKey
            fp.senderPublicKey = null;
            converted      = RiseV2.txs.fromV1Format(fp);
            converted      = RiseV2.txs.sign(converted, testSecret);
            expect(converted.id).eq(copy.id);
            expect(converted.signatures).deep.eq([
              copy.signature,
            ]);
          });
        });
      });
    });
    it('should allow testnet', () => {
      const tx = RiseV2.txs.createAndSign({
          amount   : '1',
          kind     : 'send',
          recipient: RiseV2.calcAddress(acct.publicKey, 'test'),
        },
        acct,
        'test',
        true
      );

      expect(tx.senderId).to.match(/^tise1/);
      expect(tx.recipientId).to.match(/^tise1/);
      expect(tx.senderPubData).to.deep.eq(Buffer.concat([new Buffer([1]), acct.publicKey]));
      expect(RiseV2.txs.verify(tx, tx.signatures[0], acct.publicKey)).is.true;
    });
    it('should send v1 <-> v1', () => {
      const tx = RiseV2.txs.createAndSign({
          amount   : '1',
          kind     : 'send',
          recipient: RiseV2.calcAddress(acct.publicKey),
        },
        acct,
        true
      );

      expect(tx.senderId).to.match(/^rise1/);
      expect(tx.recipientId).to.match(/^rise1/);
      expect(tx.senderPubData).to.deep.eq(Buffer.concat([new Buffer([1]), acct.publicKey]));
      expect(tx.senderId).eq(tx.recipientId);
      expect(RiseV2.txs.verify(tx, tx.signatures[0], acct.publicKey)).is.true;
    });
    it('should send v1 <-> v0', () => {
      const tx = RiseV2.txs.createAndSign({
          amount   : '1',
          kind     : 'send',
          recipient: '1R' as Address,
        },
        acct,
        true
      );

      expect(tx.senderId).to.match(/^rise1/);
      expect(tx.recipientId).to.match(/[0-9]+R$/);
      expect(tx.senderPubData).to.deep.eq(Buffer.concat([new Buffer([1]), acct.publicKey]));

      expect(RiseV2.txs.verify(tx, tx.signatures[0], acct.publicKey)).is.true;
    });
    it('should send v0 -> v1', () => {
      const tx = RiseV2.txs.createAndSign({
          amount   : '1',
          kind     : 'send',
          recipient: RiseV2.calcAddress(acct.publicKey, 'main', 'v1'),
          sender   : {
            address: RiseV2.calcAddress(acct.publicKey, 'main', 'v0'),
            publicKey: acct.publicKey,
          },
        },
        acct,
        true
      );

      expect(tx.senderId).to.match(/[0-9]+R$/);
      expect(tx.recipientId).to.match(/^rise1/);
      expect(tx.senderPubData).to.deep.eq(acct.publicKey);
      expect(RiseV2.txs.verify(tx, tx.signatures[0], acct.publicKey)).is.true;
    });
    it('should send v0 -> v0', () => {
      const tx = RiseV2.txs.createAndSign({
          amount   : '1',
          kind     : 'send',
          recipient: RiseV2.calcAddress(acct.publicKey, 'main', 'v0'),
          sender   : {
            address: RiseV2.calcAddress(acct.publicKey, 'main', 'v0'),
            publicKey: acct.publicKey,
          },
        },
        acct,
        true
      );

      expect(tx.senderId).to.match(/[0-9]+R$/);
      expect(tx.recipientId).to.match(/[0-9]+R$/);
      expect(tx.senderPubData).to.deep.eq(acct.publicKey);
      expect(RiseV2.txs.verify(tx, tx.signatures[0], acct.publicKey)).is.true;
    });
    it('should account for memo field fees', () => {
      const tx = RiseV2.txs.createAndSign({
          amount   : '1',
          kind     : 'send',
          memo     : 'ma',
          recipient: '1R' as Address,
        },
        acct,
        true
      );

      expect(tx.fee).eq('12000000');
      expect(tx.asset.data)
        .deep.eq(Buffer.from('ma', 'utf8'));

      expect(RiseV2.txs.verify(tx, tx.signatures[0], acct.publicKey)).is.true;
    });
  });
  describe('vote', () => {
    it('should allow for votes', () => {
      const tx = RiseV2.txs.createAndSign({
          kind       : 'vote',
          preferences: [
            {
              action            : '-',
              delegateIdentifier: 'meow',
            },
            {
              action            : '+',
              delegateIdentifier: 'woof',
            },
          ],
        },
        acct,
        true
      );

      expect(RiseV2.txs.verify(tx, tx.signatures[0], acct.publicKey)).is.true;
      expect(tx.asset).deep.eq({
        added  : ['woof'],
        removed: ['meow'],
      });

      RiseV2.txs.toPostable(tx);
    });

    it('should differ if sending from same pubKey with v0 and v1 address', () => {
      const tx  = RiseV2.txs.createAndSign({
          kind       : 'vote',
          preferences: [
            {
              action            : '-',
              delegateIdentifier: 'meow',
            },
            {
              action            : '+',
              delegateIdentifier: 'woof',
            },
          ],
        },
        acct,
        true
      );
      const tx2 = RiseV2.txs.createAndSign({
          kind       : 'vote',
          preferences: [
            {
              action            : '-',
              delegateIdentifier: 'meow',
            },
            {
              action            : '+',
              delegateIdentifier: 'woof',
            },
          ],
          sender     : {
            address  : RiseV2.calcAddress(acct.publicKey, 'main', 'v0'),
            publicKey: acct.publicKey,
          },
        },
        acct,
        true
      );

      expect(tx).to.not.deep.eq(tx2);
      expect(tx.senderPubData.length).greaterThan(tx2.senderPubData.length);
      expect(tx.id).not.eq(tx2.id);
    });
  });

  describe('delegate', () => {
    it('should allow v0 address', () => {
      const tx = RiseV2.txs.createAndSign({
        forgingPublicKey: Buffer.alloc(32) as Buffer & As<'publicKey'>,
        identifier: 'vekexasia' as string & As<'delegateName'>,
        kind: 'register-delegate',
        sender: {
          address: RiseV2.calcAddress(acct.publicKey, 'main', 'v0'),
          publicKey: acct.publicKey,
        },
      }, acct, true);

      expect(tx.senderId).match(/[0-9]+R$/);
      expect(tx.type).eq(12);
      expect(tx.senderPubData).deep.eq(acct.publicKey);
      expect(tx.asset).deep.eq({
        delegate: {
          forgingPK: Buffer.alloc(32).fill(0),
          username: 'vekexasia',
        },
      });
    });
    it('should allow v1 address by default', () => {
      const tx = RiseV2.txs.createAndSign({
        forgingPublicKey: Buffer.alloc(32) as Buffer & As<'publicKey'>,
        identifier: 'vekexasia' as string & As<'delegateName'>,
        kind: 'register-delegate',
      }, acct, true);

      expect(tx.senderId).not.match(/[0-9]+R$/);
      expect(tx.type).eq(12);
      expect(tx.senderPubData).deep.eq(Buffer.concat([ new Buffer([1]), acct.publicKey]));
      expect(tx.asset).deep.eq({
        delegate: {
          forgingPK: Buffer.alloc(32).fill(0),
          username: 'vekexasia',
        },
      });
    });
    it('should allow only forgingKey', () => {
      const tx = RiseV2.txs.createAndSign({
        forgingPublicKey: Buffer.alloc(32) as Buffer & As<'publicKey'>,
        kind: 'register-delegate',
      }, acct, true);

      expect(tx.asset).deep.eq({
        delegate: {
          forgingPK: Buffer.alloc(32).fill(0),
        },
      });
      expect(tx.type).eq(12);
    });
    it('should properly be converted to postable', () => {
      const tx = RiseV2.txs.createAndSign({
        forgingPublicKey: Buffer.alloc(32) as Buffer & As<'publicKey'>,
        identifier: 'vekexasia' as string & As<'delegateName'>,
        kind: 'register-delegate',
      }, acct);

      expect(tx.asset).deep.eq({
        delegate: {
          forgingPK: Buffer.alloc(32).fill(0).toString('hex'),
          username: 'vekexasia',
        },
      });
      expect(tx.type).eq(12);
    });
  });
});
