
import { BaseTx } from './trxTypes/BaseTx';
import { SendTx } from './trxTypes/Send';

export class TransactionBuilder<T, K extends BaseTx> {
  private data: {
    senderPublicKey: string;
    requesterPublicKey: string;
    timestamp: number;
    amount: number;
    recipientId: string;
  } = {} as any;

  constructor() {

  }

  withSenderPublicKey(publicKey:string): this {
    this.data.senderPublicKey = publicKey;
    return this;
  }

  withRequesterPublicKey(requesterPublicKey:string): this {
    this.data.requesterPublicKey = requesterPublicKey;
    return this;
  }

  withTimeStamp(timestamp:number): this {
    this.data.timestamp = timestamp;
    return this;
  }

  withRecipientId(recipientId:string): this {
    this.data.recipientId = recipientId;
    return this;
  }

  withAmount(amount:number): this {
    this.data.amount = amount;
    return this;
  }

  build(txSubType: K): K {
    Object.assign(txSubType,this.data);
    return txSubType
  }
}