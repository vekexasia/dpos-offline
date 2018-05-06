import {expect} from 'chai';
import { GenericWallet } from '../src/wallet';
import { ITransaction } from '../src/trxTypes/BaseTx';
import { LiskWallet } from '../src';
import { testSecret, testWallet } from './testConsts';
import { SendTx } from '../src/trxTypes';

class Test extends GenericWallet {
  get address() {
    return null;
  }

  protected deriveAddress() {
    return null;
  }

  get addressOptions() {
    return { suffixLength: 0, suffix: '' };
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
    it('should verify valid real messages', () => {
      const messages = [
        {
          pubKey: 'e4f69a118b8bc4ef27cca241968da0635116554ad252a77f6ad2444fa4e4c476',
          message: 'Look I found the lisk.support secret key !!',
          signature: '57c4bfc0ceb263afed4b8fa0505648b42a17c2304a59d1dc78476cbb6bb609307ebaff52a4bc295020e931db1bff247fb5ec9749f5f78ddea8162d7311c72a054c6f6f6b204920666f756e6420746865206c69736b2e737570706f727420736563726574206b6579202121'
        },
        {
          pubKey: 'e4c0280812a7def0822a2d72609839f1c40946d0304fdc7ac11a0056028f0b40',
          message: 'Look I found the lisk.support secret key !!',
          signature: '11a5dc9bc0ffea4006b6a1a3ff4425a1d35eab6d9590c7697fc1ddd32ccad40d6e7244e3ad2729aeef36c4533b4347bc947027bae286a64c68860dee81f6e70d4c6f6f6b204920666f756e6420746865206c69736b2e737570706f727420736563726574206b6579202121'
        },
        {
          pubKey: '033a1474b9b52737793ed22cf1f1fb5ba133c8e6433029607158180fe16db7b3',
          message: 'Look I found the lisk.support secret key !!',
          signature: 'c7e00509c06f52882e5e89b77a97138b662e547f627cf1036147850a172bbb4f1b6c50f4db484047e2a72b576e7ed13362962d49e3d771ca7f018e2345f6d20c4c6f6f6b204920666f756e6420746865206c69736b2e737570706f727420736563726574206b6579202121'
        },
      ];

      for (const m of messages) {
        expect(GenericWallet.verifyMessage(m.message, m.signature, m.pubKey)).is.true;
      }
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
  describe('signTransaction', () => {
    let txObj: ITransaction<any>;
    beforeEach(() => {
      txObj = {
        type: 0,
        amount: 8840,
        senderPublicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
        requesterPublicKey: null,
        timestamp: 6030,
        asset: {},
        recipientId: '2581762640681118072L',
        // recipientId: null,
        signature: null,
        // signature: '23189880562d8fa55f723f673c7b6afacb9712da8647bd140d589a9ecac6aa10215cd00e922bb0ec548bccbde7b40ffb3a30ae97e4e7b5e86d93129f7f36b80e',
        id: '10564000757818327695',
        fee: 10000000,
      };

    });
    it('should allow plain tx', () => {
      const out = testWallet.signTransaction(txObj);
      expect(out.signature).to.be.eq('23189880562d8fa55f723f673c7b6afacb9712da8647bd140d589a9ecac6aa10215cd00e922bb0ec548bccbde7b40ffb3a30ae97e4e7b5e86d93129f7f36b80e');
    });
    it('should allow BaseTX obj', () => {
      const tx = new SendTx()
        .set('amount', txObj.amount)
        .set('recipientId', txObj.recipientId)
        .set('timestamp', 6030)
        .set('fee', 10000000);
      const out = testWallet.signTransaction(tx);
      expect(out.signature).to.be.eq('23189880562d8fa55f723f673c7b6afacb9712da8647bd140d589a9ecac6aa10215cd00e922bb0ec548bccbde7b40ffb3a30ae97e4e7b5e86d93129f7f36b80e');
    });
    it('should take into account different suffix lengths', () => {
      const diffSuffxWallet = new LiskWallet(testSecret, 'HAHA');
      txObj.recipientId = '2581762640681118072HAHA';
      const out = diffSuffxWallet.signTransaction(txObj);
      expect(out.signature).to.be.eq('23189880562d8fa55f723f673c7b6afacb9712da8647bd140d589a9ecac6aa10215cd00e922bb0ec548bccbde7b40ffb3a30ae97e4e7b5e86d93129f7f36b80e');
    });

  });

  describe('getSignatureOfTransaction', () => {

  })
});
