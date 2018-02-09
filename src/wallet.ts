import { toSha256 } from './utils/sha256';
import { api as sodium } from './utils/sodium';

// tslint:disable-next-line no-var-requires
/**
 * Generic Abstract Wallet.
 */
export abstract class GenericWallet {
  /**
   * Verifies message. Returns true or throws error if verification fails
   * @param {string | Buffer} message
   * @param {string | Buffer} signature
   * @param {string | Buffer} pubKey
   * @returns {true}
   */
  public static verifyMessage(message: string | Buffer,
                              signature: string | Buffer,
                              pubKey: string | Buffer): true {
    if (typeof(message) === 'string') {
      message = new Buffer(message, 'utf8');
    }
    if (typeof(signature) === 'string') {
      signature = new Buffer(signature, 'hex');
    }
    if (typeof(pubKey) === 'string') {
      pubKey = new Buffer(pubKey, 'hex');
    }
    if (pubKey.length !== 32) {
      throw new Error('Invalid public Key');
    }

    const open: Buffer = sodium.crypto_sign_open(
      signature,
      pubKey
    );

    if (!open) {
      throw new Error('Invalid signature. Cannot verify message');
    }

    if (open.toString('hex') !== message.toString('hex')) {
      throw new Error('Signature is valid but different message');
    }
    return true;
  }
  // tslint:disable variable-name
  protected _privKey: string;
  protected _publicKey: string;

  protected _address: string;

  // tslint:enable variable-name

  constructor(secret: string) {
    this.createKeyPair(secret);
  }

  public signMessage(message: string | Buffer) {
    if (typeof(message) === 'string') {
      message = new Buffer(message, 'utf8');
    }
    return sodium.crypto_sign(message, new Buffer(this.privKey, 'hex'));
  }

  /**
   * Creates key pair from secret string
   * @param {string} secret
   */
  protected createKeyPair(secret: string) {
    const hash      = toSha256(secret);
    const keypair   = sodium.crypto_sign_seed_keypair(hash);
    this._privKey   = keypair.secretKey.toString('hex');
    this._publicKey = keypair.publicKey.toString('hex');
  }

  abstract get address();

  protected abstract deriveAddress();

  /**
   * @returns {string} privateKey
   */
  get privKey(): string {
    return this._privKey;
  }

  /**
   * @returns {string} publicKey
   */
  get publicKey(): string {
    return this._publicKey;
  }
}
