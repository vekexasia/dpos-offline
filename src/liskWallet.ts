import {GenericWallet} from './wallet';
import {bigNumberFromBuffer} from './utils/bignumber';
import {toSha256} from './utils/sha256';

/**
 * Lisk Wallet.
 * you can use this wallet class to instantiate other coins wallets such as RISE,SHIFT,OXY etc.
 */
export class LiskWallet extends GenericWallet {

  constructor(secret: string, private suffix:string = 'L') {
    super(secret);
  }

  /**
   * @returns {string} derived address.
   */
  get address() {
    if (typeof(this._address) == 'undefined') {
      this.deriveAddress();
    }
    return this._address;
  }

  /**
   * calculates the address from publicKey.
   */
  protected deriveAddress() {
    const hash = toSha256(new Buffer(this.publicKey, 'hex'));
    const temp = new Buffer(8);
    for (let i = 0; i < 8; i++) {
      temp[i] = hash[7 - i];
    }
    this._address  = `${bigNumberFromBuffer(temp).toString()}${this.suffix}`;
  }

}