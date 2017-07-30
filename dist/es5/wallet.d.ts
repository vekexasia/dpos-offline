/**
 * Generic Abstract Wallet.
 */
export declare abstract class GenericWallet {
    protected _privKey: string;
    protected _publicKey: string;
    protected _address: string;
    constructor(secret: string);
    /**
     * Creates key pair from secret string
     * @param {string} secret
     */
    protected createKeyPair(secret: string): void;
    readonly abstract address: any;
    protected abstract deriveAddress(): any;
    /**
     * @returns {string} privateKey
     */
    readonly privKey: string;
    /**
     * @returns {string} publicKey
     */
    readonly publicKey: string;
}
