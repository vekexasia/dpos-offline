import { LiskWallet } from '../src/liskWallet';

export const testSecret = 'wagon stock borrow episode laundry kitten salute link globe zero feed marble';
export const testSecondSecret = 'amount lucky fee spider roast sign disease ball innocent luggage dust chunk';
export const testWallet = new LiskWallet(testSecret);

export const testPrivKey = testWallet.privKey;
export const testPubKey  = testWallet.publicKey;
