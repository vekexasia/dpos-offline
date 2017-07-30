/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface InTransferAssetType {
    inTransfer: {
        dappId: string;
    };
}
/**
 * In transfer transaction
 */
export declare class InTransferTx extends BaseTx<InTransferAssetType> {
    type: number;
    constructor(asset?: InTransferAssetType);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
