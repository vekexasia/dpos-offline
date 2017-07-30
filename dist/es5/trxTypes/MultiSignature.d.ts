/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface MultiSignatureAssetType {
    multisignature: {
        min: number;
        keysgroup: any[];
        lifetime: number;
    };
}
/**
 * Multi signature transaction.
 */
export declare class MultiSignatureTx extends BaseTx<MultiSignatureAssetType> {
    type: number;
    amount: number;
    constructor(asset?: MultiSignatureAssetType);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
