let toExport;
// tslint:disable no-var-requires
try {
  const sodiumNative = require('sodium-native');

  toExport = {
    api: {
      crypto_sign_seed_keypair(hash: Buffer) {
        const publicKey = Buffer.alloc(sodiumNative.crypto_sign_PUBLICKEYBYTES);
        const secretKey = Buffer.alloc(sodiumNative.crypto_sign_SECRETKEYBYTES);
        sodiumNative.crypto_sign_seed_keypair(publicKey, secretKey, hash);
        return { secretKey, publicKey };
      },
      crypto_sign_detached(what: Buffer, privKey: Buffer) {
        const signature = Buffer.alloc(sodiumNative.crypto_sign_BYTES);
        sodiumNative.crypto_sign_detached(signature, what, privKey);
        return signature;
      },
      crypto_sign_open(signature: Buffer, pubKey: Buffer) {
        const msg      = Buffer.alloc(signature.length - sodiumNative.crypto_sign_BYTES);
        const verified = sodiumNative.crypto_sign_open(msg, signature, pubKey);
        if (!verified) {
          return null;
        }
        return msg;
      },
      crypto_sign(what: Buffer, privKey: Buffer) {
        const signature = Buffer.alloc(sodiumNative.crypto_sign_BYTES + what.length);
        sodiumNative.crypto_sign(signature, what, privKey);
        return signature;
      },
    },
  };
  if (typeof(toExport) === 'undefined' || typeof(toExport.api) === 'undefined') {
    throw new Error('switch to JS implementation');
  }
} catch (err) {
  // Sodium does not exist.
  toExport = require('../browser/sodium');
}
export const api = toExport.api;
