/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface OutTransferAssetType {
    outTransfer: {
        dappId: string;
        transactionId: string;
    };
}
/**
 * Out transfer dapp transaction
 */
export declare class OutTransferTx extends BaseTx<OutTransferAssetType> {
    type: number;
    constructor(asset?: OutTransferAssetType);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
