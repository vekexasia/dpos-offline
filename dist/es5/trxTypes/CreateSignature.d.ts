/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface ICreateSignatureAssetType {
    signature: {
        publicKey: string;
    };
}
/**
 * Transaction of type "Create second signature".
 */
export declare class CreateSignatureTx extends BaseTx<ICreateSignatureAssetType> {
    type: number;
    amount: number;
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
