/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface IMultiSignatureAssetType {
    multisignature: {
        min: number;
        keysgroup: any[];
        lifetime: number;
    };
}
/**
 * Multi signature transaction.
 */
export declare class MultiSignatureTx extends BaseTx<IMultiSignatureAssetType> {
    type: number;
    amount: number;
    constructor(asset?: IMultiSignatureAssetType);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
