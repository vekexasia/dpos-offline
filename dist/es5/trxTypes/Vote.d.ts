/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface IVoteAsset {
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
export declare class VoteTx extends BaseTx<IVoteAsset> {
    type: number;
    amount: number;
    constructor(asset?: IVoteAsset);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
