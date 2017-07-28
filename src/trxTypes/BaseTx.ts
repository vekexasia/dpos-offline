import * as empty from 'is-empty';
import * as ByteBuffer from 'bytebuffer';
import * as BigNumber from 'bignumber.js';
import * as crypto from 'crypto';
import { api as sodium } from 'sodium';
import { bigNumberFromBuffer, bigNumberToBuffer } from '../utils';

export abstract class BaseTx<T = {}> {
  recipientId: string;
  amount: number;
  senderPublicKey: string;
  requesterPublicKey: string = null;
  timestamp: number;
  asset: T                   = {} as any;

  // Transient
  _signature: string;
  _secondSignature?: string;
  _id: string;

  abstract fee: number;
  abstract type: number;

  create(signingPrivKey: string, signingSecondPrivKey?: string): this {
    if (empty(this.type) && this.type !== 0) {
      throw new Error(`Unknown transaction type ${this.type}`);
    }
    if (empty(this.senderPublicKey)) {
      throw new Error(`Sender Public Key is empty`);
    }
    if (empty(this.timestamp) && this.timestamp < 0) {
      throw new Error(`Invalid timestamp provided`);
    }

    this.innerCreate();

    this._signature = this.createSignature(signingPrivKey).toString('hex');
    if (!empty(signingSecondPrivKey)) {
      this._secondSignature = this.createSignature(signingSecondPrivKey).toString('hex');
    }

    this._id = this.calcId();
    return this;
  }

  toString() {
    if (empty(this._signature)) {
      throw new Error('Tx is not signed');
    }
    return JSON.stringify(
      {
        id                : this._id,
        fee               : this.fee,
        type              : this.type,
        recipientId       : this.recipientId,
        amount            : this.amount,
        senderPublicKey   : this.senderPublicKey,
        requesterPublicKey: this.requesterPublicKey,
        timestamp         : this.timestamp,
        signature         : this._signature,
        secondSignature   : this._secondSignature || null,
        asset             : this.asset
      },
      null,
      2
    )
  }

  protected createSignature(privKey: string) {
    const hash = this.getHash();
    return sodium.crypto_sign_detached(
      hash,
      new Buffer(privKey, 'hex')
    );
  }

  calcId(): string {
    const hash = this.getHash();
    const temp = new Buffer(8);
    for (let i = 0; i < 8; i++) {
      temp[i] = hash[7 - i];
    }

    return bigNumberFromBuffer(temp).toString()
  }

  getHash(): Buffer {
    return crypto.createHash('sha256').update(this.getBytes()).digest()
  }

  getBytes(skipSignature: boolean = false, skipSecondSign: boolean = false): Buffer {
    const childBytes = this.getChildBytes(skipSignature, skipSecondSign);
    const assetSize  = empty(childBytes) ? 0 : childBytes.length;
    const bb         = new ByteBuffer(1 + 4 + 32 + 32 + 8 + 8 + 64 + 64 + assetSize, true);
    bb.writeByte(this.type);
    bb.writeInt(this.timestamp);

    BaseTx.hexKeyInByteBuffer(this.senderPublicKey, bb);

    if (!empty(this.requesterPublicKey)) {
      BaseTx.hexKeyInByteBuffer(this.requesterPublicKey, bb);
    }

    if (!empty(this.recipientId)) {
      const recipient = bigNumberToBuffer(
        new BigNumber(this.recipientId.slice(0, -1)),
        {size: 8}
      );
      for (let i = 0; i < 8; i++) {
        bb.writeByte(recipient[i] || 0);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        bb.writeByte(0);
      }
    }

    bb['writeLong'](this.amount);

    if (assetSize > 0) {
      for (let i = 0; i < assetSize; i++) {
        bb.writeByte(childBytes[i]);
      }
    }

    if (!skipSignature && !empty(this._signature)) {
      BaseTx.hexKeyInByteBuffer(this._signature, bb);
    }

    if (!skipSecondSign && !empty(this._secondSignature)) {
      BaseTx.hexKeyInByteBuffer(this._secondSignature, bb);
    }
    bb.flip();

    // TODO: Check? this returns an array buffer which does not
    // inherit from buffer (according to ts types).
    return bb.toBuffer() as any;
  }

  public static hexKeyInByteBuffer(hex: string, bb: ByteBuffer) {
    const buf = new Buffer(hex, 'hex');
    for (let i = 0; i < buf.length; i++) {
      bb.writeByte(buf[i]);
    }
  }

  /**
   * Override to calculate asset bytes.
   * @param {boolean} skipSignature
   * @param {boolean} skipSecondSign
   */
  protected abstract getChildBytes(skipSignature: boolean, skipSecondSign: boolean);


  /**
   * override this to allow asset and other fields creations.
   * for different tx types.
   */
  protected abstract innerCreate();


}