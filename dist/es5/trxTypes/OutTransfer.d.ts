/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface IOutTransferAssetType {
    outTransfer: {
        dappId: string;
        transactionId: string;
    };
}
/**
 * Out transfer dapp transaction
 */
export declare class OutTransferTx extends BaseTx<IOutTransferAssetType> {
    type: number;
    constructor(asset?: IOutTransferAssetType);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
