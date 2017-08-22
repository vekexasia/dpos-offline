/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface IInTransferAssetType {
    inTransfer: {
        dappId: string;
    };
}
/**
 * In transfer transaction
 */
export declare class InTransferTx extends BaseTx<IInTransferAssetType> {
    type: number;
    constructor(asset?: IInTransferAssetType);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
