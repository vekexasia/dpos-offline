/// <reference types="node" />
import { BaseTx } from './BaseTx';
/**
 * Defines a Dapp
 */
export interface Dapp {
    category: number;
    name: string;
    description: string;
    tags: string;
    type: number;
    link: string;
    icon: string;
}
export interface MultiSignatureAssetType {
    dapp: Dapp;
}
/**
 * Dapp Transaction
 */
export declare class DappTx extends BaseTx<MultiSignatureAssetType> {
    type: number;
    amount: number;
    constructor(asset?: MultiSignatureAssetType);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
