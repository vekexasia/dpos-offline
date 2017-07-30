/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface VoteAsset {
    /**
     * string array in the following format:
     *  ['-publicKey1', '+publicKey2']
     *  to remove publicKey1 and add publicKey2 among voted delegates
     */
    votes: string[];
}
/**
 * Vote transactions
 */
export declare class VoteTx extends BaseTx<VoteAsset> {
    type: number;
    amount: number;
    constructor(asset?: VoteAsset);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
