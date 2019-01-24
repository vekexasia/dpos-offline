import { expect } from 'chai';
import { Address, RiseV2 } from '../../src/codecs';
import * as bech32 from 'bech32';
import { toSha256 } from '../../src/utils/sha256';

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
    it('should send v1 <-> v1', () => {
      const tx = RiseV2.txs.createAndSign({
          amount   : '1',
          kind     : 'send',
          recipient: RiseV2.calcAddress(acct.publicKey),
        },
        acct,
        true
      );

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
          kind     : 'vote',
          preferences: [
            {
              action: '-',
              delegateIdentifier: 'meow',
            },
            {
              action: '+',
              delegateIdentifier: 'woof',
            },
          ],
        },
        acct,
        true
      );

      console.log(tx);
      expect(RiseV2.txs.verify(tx, tx.signatures[0], acct.publicKey)).is.true;
      expect(tx.asset).deep.eq({
        added:   ['woof'],
        removed: ['meow'],
      });
    });

    it('should differ if sending from same pubKey ')
  });

});
