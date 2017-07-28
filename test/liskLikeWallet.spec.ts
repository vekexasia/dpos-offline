import {LiskLikeWallet} from '../src/liskLikeWallet'
import {expect} from 'chai';
const testWallets = require(__dirname+'/data/wallets.json');
class SHIFTWallet extends LiskLikeWallet {
  protected suffix(): string {
    return 'S';
  }
}
describe('LISK Like Wallets', () => {
  testWallets.forEach(w => {
    describe(`${w.address} tests`, () => {
      let wallet = new SHIFTWallet(w.secret);
      it ('should derive publicKey correctly', () => {
        expect(wallet.publicKey).to.be.deep.eq(w.publicKey);
      });
      it ('should derive address correctly', () => {
        expect(wallet.address).to.be.deep.eq(w.address);
      });
    });
  });
});