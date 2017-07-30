/// <reference types="node" />
export interface ToFromBufferOpts {
    /**
     * Size of the buffer
     */
    size?: 'auto' | number;
    /**
     * Encoding type.
     */
    endian?: 'big' | 'little';
}
/**
 * Calculates BigNumber from buffer representation
 * @param {Buffer} buf
 * @param {ToFromBufferOpts} opts
 */
export declare const bigNumberFromBuffer: (buf: Buffer, opts?: ToFromBufferOpts) => any;
/**
 * Exports bignumber to buffer.
 * @returns {Buffer}
 */
export declare const bigNumberToBuffer: (bignum: any, opts?: ToFromBufferOpts) => Buffer;
