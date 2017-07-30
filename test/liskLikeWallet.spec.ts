import {LiskWallet} from '../src/liskWallet'
import {expect} from 'chai';
const testWallets = require(__dirname+'/data/wallets.json');

describe('LISK Like Wallets', () => {
  testWallets.forEach(w => {
    describe(`${w.address} tests`, () => {
      let wallet = new LiskWallet(w.secret,'S');
      it ('should derive publicKey correctly', () => {
        expect(wallet.publicKey).to.be.deep.eq(w.publicKey);
      });
      it ('should derive address correctly', () => {
        expect(wallet.address).to.be.deep.eq(w.address);
      });
    });
  });
});