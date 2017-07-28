import { GenericWallet } from './wallet';
import * as crypto from 'crypto';
import { bigNumberFromBuffer } from './utils';

export abstract class LiskLikeWallet extends GenericWallet {

  protected deriveAddress() {
    const hash = crypto.createHash('sha256')
      .update(
        new Buffer(
          this.publicKey,
          'hex'
        )
      )
      .digest();

    const temp = new Buffer(8);
    for (let i = 0; i < 8; i++) {
      temp[i] = hash[7 - i];
    }
    this._address  = `${bigNumberFromBuffer(temp).toString()}${this.suffix()}`;
  }

  protected abstract suffix():string;
}