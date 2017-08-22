/// <reference types="node" />
import { BaseTx } from './BaseTx';
/**
 * Defines a Dapp
 */
export interface IDapp {
    category: number;
    name: string;
    description: string;
    tags: string;
    type: number;
    link: string;
    icon: string;
}
export interface IMultiSignatureAssetType {
    dapp: IDapp;
}
/**
 * Dapp Transaction
 */
export declare class DappTx extends BaseTx<IMultiSignatureAssetType> {
    type: number;
    amount: number;
    constructor(asset?: IMultiSignatureAssetType);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
