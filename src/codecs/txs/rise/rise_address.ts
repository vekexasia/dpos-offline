import * as bech32 from 'bech32-buffer';
import * as Long from 'long';
import { As } from 'type-tagger';
import { toSha256 } from '../../../utils/sha256';
import { Address } from '../../interface';

export class RiseIdsHandler {

  public static addressFromBytes(bytes: Buffer): Address {
    if (bytes.length === 0) {
      return null;
    }
    if (bytes.length === 8) {
      return `${Long.fromBytes([...bytes], true, false).toString(10)}R` as Address;
    } else {
      return bech32.encode(
        bytes.slice(0, 4).toString('ascii'),
        bytes.slice(4)
      ) as Address;
    }
  }

  public static addressFromPubData(pubKey: Buffer): Address {
    if (pubKey[0] === 1 && pubKey.length === 33) {
      return bech32.encode(
        'rise',
        pubKey
      ) as string & As<'address'>;
    }
    const hash = toSha256(pubKey);
    const temp = [];
    for (let i = 0; i < 8; i++) {
      temp.push(hash[7 - i]);
    }
    return `${Long.fromBytesBE(temp, true).toString()}L` as Address;
  }

  public static addressToBytes(address: Address): Buffer {
    if (!address) {
      return Buffer.alloc(0);
    }
    if (/^[0-9]+R$/i.test(address)) {
      if (address.substring(-1) === 'r') {
        throw new Error('Invalid address');
      }
      return new Buffer(Long.fromString(address.slice(0, -1)).toBytesBE());
    } else {
      const res = bech32.decode(address);
      return Buffer.concat([
        Buffer.from(res.prefix, 'ascii'),
        new Buffer(res.data),
      ]);
    }
  }

  // public static calcBlockIdFromBytes(bytes: Buffer): string {
  //   return this.toBigInt(bytes).toString();
  // }

  public static calcTxIdFromBytes(bytes: Buffer): string {
    return `${this.toBigInt(bytes)}`;
  }

  private static toBigInt(bytes: Buffer) {
    const hash = toSha256(bytes);
    const tmp = Buffer.alloc(8);
    for (let i = 0; i < 8; i++) {
      tmp[i] = hash[7 - i];
    }
    return Long.fromBytes([... tmp], true, false).toString(10);
  }
}
