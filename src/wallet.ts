import {api as sodium} from 'sodium';
import {toSha256} from './utils/sha256'

/**
 * Generic Abstract Wallet.
 */
export abstract class GenericWallet {
  protected _privKey: string;
  protected _publicKey: string;
  protected _address: string;

  constructor(secret: string) {
    this.createKeyPair(secret);
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

  protected abstract  deriveAddress();

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