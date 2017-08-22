/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface IDelegateTxAsset {
    delegate: {
        username: string;
        publicKey: string;
    };
}
export declare class DelegateTx extends BaseTx<IDelegateTxAsset> {
    type: number;
    amount: number;
    constructor(asset?: IDelegateTxAsset);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
