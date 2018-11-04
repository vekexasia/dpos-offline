import { expect } from 'chai';
import { IRegisterDelegateTx, ISendTx, IVoteTx, Rise, RecipientId } from '../../src/codecs';
import { As } from 'type-tagger';
import { testSecondSecret, testSecret } from '../testConsts';

describe('rise.codec', () => {
  describe('wallet address derivation', () => {
    const wallets = require(`${__dirname}/../data/wallets.json`);
    wallets.forEach((w) => {
      describe(`Wallet ${w.address}`, () => {
        it('will derive address properly', () => {
          expect(Rise.calcAddress(Rise.deriveKeypair(w.secret).publicKey)).eq(w.address.replace('L','R'));
        });
      });
    });
  });
  describe('send', () => {
    const sendObj: ISendTx = {
      sender   : Rise.deriveKeypair(testSecret),
      kind     : 'send',
      amount   : '10',
      recipient: '1R' as RecipientId,
    };
    it('transforms, sign and verify properly', () => {
      const t = Rise.txs.transform(sendObj);
      expect(t.type).eq(0);
      expect(t.amount).eq(10);
      expect(t.timestamp).gt(0);
      expect(t.fee).eq(10000000);
      const signedTx = Rise.txs.sign(t, testSecret);
      expect(Rise.txs.verify(signedTx));
    });
  });
});
