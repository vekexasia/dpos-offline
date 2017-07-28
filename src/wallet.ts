import { api as sodium } from 'sodium';
import * as crypto from 'crypto';

export class GenericWallet {
  protected _privKey: string;
  protected _publicKey: string;
  protected _address: string;

  constructor(secret: string) {
    this.createKeyPair(secret);
    this.deriveAddress();
  }

  protected createKeyPair(secret: string) {
    const hash      = crypto.createHash('sha256').update(secret, 'utf8').digest();
    const keypair   = sodium.crypto_sign_seed_keypair(hash);
    this._privKey   = keypair.secretKey.toString('hex');
    this._publicKey = keypair.publicKey.toString('hex');
  }

  protected deriveAddress() {
    throw new Error('Cannot derive address from dft wallet implementation');
  }

  get privKey(): string {
    return this._privKey;
  }

  get publicKey(): string {
    return this._publicKey;
  }

  get address(): string {
    return this._address;
  }

}