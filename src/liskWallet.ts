import {deriveDPOSAddress} from './utils/dposUtils';
import {GenericWallet} from './wallet';

/**
 * Lisk Wallet.
 * you can use this wallet class to instantiate other coins wallets such as RISE,SHIFT,OXY etc.
 */
export class LiskWallet extends GenericWallet {

  constructor(secret: string, private suffix: string = 'L') {
    super(secret);
  }

  /**
   * @returns {string} derived address.
   */
  get address() {
    if (typeof(this._address) === 'undefined') {
      this.deriveAddress();
    }
    return this._address;
  }

  /**
   * calculates the address from publicKey.
   */
  protected deriveAddress() {
    this._address = deriveDPOSAddress(this.publicKey, this.suffix);
  }

  protected get addressOptions(): { suffixLength: number, suffix: string } {
    return {
      suffix: this.suffix,
      suffixLength: this.suffix.length,
    };
  }

}
