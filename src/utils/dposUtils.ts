import {bigNumberFromBuffer} from './bignumber';
import {toSha256} from './sha256';

/**
 * Derive an address from the public key
 * @param {string} publicKey publicKey to derive address from
 * @param {string} suffix a suffix character
 * @returns {string} the calculated address
 */
export const deriveDPOSAddress = (publicKey: string, suffix: string): string => {
  const hash = toSha256(new Buffer(publicKey, 'hex'));
  const temp = new Buffer(8);
  for (let i = 0; i < 8; i++) {
    temp[i] = hash[7 - i];
  }
  return `${bigNumberFromBuffer(temp).toString()}${suffix}`;
};
