/// <reference types="node" />
import { BaseTx } from './BaseTx';
export interface DelegateTxAsset {
    delegate: {
        username: string;
        publicKey: string;
    };
}
export declare class DelegateTx extends BaseTx<DelegateTxAsset> {
    type: number;
    amount: number;
    constructor(asset?: DelegateTxAsset);
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer;
}
