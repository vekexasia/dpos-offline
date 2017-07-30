import { BaseTx } from './BaseTx';
/**
 * Send coins transaction
 */
export declare class SendTx extends BaseTx {
    type: number;
    constructor();
    protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): any;
    protected innerCreate(): void;
}
