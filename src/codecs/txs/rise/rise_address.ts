import * as bech32 from 'bech32-buffer';
import * as Long from 'long';
import { As } from 'type-tagger';
import { toSha256 } from '../../../utils/sha256';
import { Address } from '../../interface';
import { Lisk } from '../../lisk';
import { RiseV2 } from '../../rise_v2';

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
      return RiseV2.calcAddress(
        pubKey.slice(1) as Buffer & As<'publicKey'>,
        'main',
        'v1'
      );
    }
    return RiseV2.calcAddress(pubKey as Buffer & As<'publicKey'>, 'main', 'v0');
  }

  public static addressToBytes(address: Address): Buffer {
    if (!address) {
      return Buffer.alloc(0);
    }
    if (/^[0-9]+R$/i.test(address)) {
      if (address.substring(-1) === 'r') {
        throw new Error('Invalid address');
      }
      return Lisk.txs.getAddressBytes(address);
    } else {
      // TODO: Eventually move codebase from lib to here.
      return RiseV2.txs.getAddressBytes(address);
    }
  }

  public static calcBlockIdFromBytes(bytes: Buffer): string {
    return this.toBigInt(bytes).toString();
  }

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
