/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface CreateSignatureAssetType {
    signature: {
        publicKey: string;
    };
}
/**
 * Transaction of type "Create second signature".
 */
export declare class CreateSignatureTx extends BaseTx<CreateSignatureAssetType> {
    type: number;
    amount: number;
    constructor(asset?: CreateSignatureAssetType);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
