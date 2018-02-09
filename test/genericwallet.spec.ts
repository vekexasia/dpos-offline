import { expect } from 'chai';
import { GenericWallet } from '../src/wallet';

class Test extends GenericWallet {
  get address() {
    return null;
  }

  protected deriveAddress() {
    return null;
  }
}
describe('genericwallet', () => {
  describe('[static]verifyMessage', () => {
    const validSignature = '296b44717d4a54d218105a9a1169b0e490db95c37d345b02369b0285cd809924881771d09d3e19f526a6ae5cb6579dc4e604a52e5ef17bd836cebae24cde9e0674657374';
    const message = 'test';
    const pubKey = '1e82c7db09da2010e7f5fef24d83bc46238a20ef7ecdf12d9f32e4318a818777';
    it('should go ok if all passed as string', () => {
      const res = GenericWallet.verifyMessage(
        message,
        validSignature,
        pubKey
      );
      expect(res).is.true;
    });
    it('should go ok even if all passed as buffer', () => {
      const res = GenericWallet.verifyMessage(
        new Buffer(message, 'utf8'),
        new Buffer(validSignature, 'hex'),
        new Buffer(pubKey, 'hex')
      );
      expect(res).is.true;
    });
    it('should throw if pubkey is wrong', () => {
      expect(() => GenericWallet.verifyMessage(
        new Buffer(message, 'utf8'),
        new Buffer(validSignature, 'hex'),
        new Buffer(`${pubKey}ab`, 'hex')
      )).to.throw('Invalid public Key');
    });
    it('should throw if signature is invalid', () => {
      expect(() => GenericWallet.verifyMessage(
        new Buffer(message, 'utf8'),
        new Buffer(`${validSignature}ab`, 'hex'),
        new Buffer(pubKey, 'hex')
      )).to.throw('Invalid signature. Cannot verify message');
    });
    it('should throw if signature valid but diff message', () => {
      expect(() => GenericWallet.verifyMessage(
        new Buffer(`${message}ab`, 'utf8'),
        new Buffer(validSignature, 'hex'),
        new Buffer(pubKey, 'hex')
      )).to.throw('Signature is valid but different message');
    });
  });
  describe('.signMessage', () => {
    const passphrase = 'imitate brain only inhale fancy garment exercise promote extend reopen help festival';
    const validSignature = '296b44717d4a54d218105a9a1169b0e490db95c37d345b02369b0285cd809924881771d09d3e19f526a6ae5cb6579dc4e604a52e5ef17bd836cebae24cde9e0674657374';
    const message = 'test';
    it('should create a valid signature from string that can be verified', () => {
      const dummyWallet = new Test(passphrase);
      const signature = dummyWallet.signMessage(message);
      expect(GenericWallet.verifyMessage(
        message,
        signature,
        dummyWallet.publicKey
      )).is.true;
    });
    it('should create a valid signature from buffer that can be verified', () => {
      const dummyWallet = new Test(passphrase);
      const signature = dummyWallet.signMessage(new Buffer(message, 'utf8'));
      expect(GenericWallet.verifyMessage(
        message,
        signature,
        dummyWallet.publicKey
      )).is.true;
    });
  });
});
