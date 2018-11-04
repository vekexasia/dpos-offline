import * as tweetNACL from 'tweetnacl';
import * as tweetNACLUtil from 'tweetnacl-util';
// tslint:disable-next-line
tweetNACL['util'] = tweetNACLUtil;

export function toBuffer(ab) {
  if (ab === null) {
    return null;
  }
  const buf  = new Buffer(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

export const api = {
  crypto_sign_open(signature: Buffer, publicKey: Buffer) {
    return toBuffer(tweetNACL.sign.open(signature, publicKey));
  },
  crypto_sign(message: Buffer, privateKey: Buffer) {
    return toBuffer(tweetNACL.sign(message, privateKey));
  },
  // tslint:disable-next-line
  crypto_sign_seed_keypair(_32ByteSeed: Buffer) {
    const res = tweetNACL.sign.keyPair.fromSeed(_32ByteSeed);
    return {
      publicKey: toBuffer(res.publicKey),
      secretKey: toBuffer(res.secretKey),
    };
  },
  crypto_sign_detached(msg: Buffer, privKey: Buffer) {
    return toBuffer(tweetNACL.sign.detached(msg, privKey));
  },
  crypto_sign_verify_detached(signature: Buffer, msg: Buffer, publicKey: Buffer) {
    return tweetNACL.sign.detached.verify(msg, signature, publicKey);
  },
};
