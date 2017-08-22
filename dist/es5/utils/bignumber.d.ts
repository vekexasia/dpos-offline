/// <reference types="node" />
export interface IToFromBufferOpts {
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
export declare const bigNumberFromBuffer: (buf: Buffer, opts?: IToFromBufferOpts) => any;
/**
 * Exports bignumber to buffer.
 * @returns {Buffer}
 */
export declare const bigNumberToBuffer: (bignum: any, opts?: IToFromBufferOpts) => Buffer;
