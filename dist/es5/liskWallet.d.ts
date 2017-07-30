import { GenericWallet } from './wallet';
/**
 * Lisk Wallet.
 * you can use this wallet class to instantiate other coins wallets such as RISE,SHIFT,OXY etc.
 */
export declare class LiskWallet extends GenericWallet {
    private suffix;
    constructor(secret: string, suffix?: string);
    /**
     * @returns {string} derived address.
     */
    readonly address: string;
    /**
     * calculates the address from publicKey.
     */
    protected deriveAddress(): void;
}
