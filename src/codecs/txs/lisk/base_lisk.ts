// tslint:disable max-line-length
import { IBaseTx, IBaseTxCodec } from '../base';
import { Address } from '../../interface';
import * as ByteBuffer from 'bytebuffer';
import * as empty from 'is-empty';
import { Overwrite } from 'utility-types';
import { As } from 'type-tagger';
import * as Long from 'long';

export type LiskTransaction<AssetType> = {
  recipientId: Address;
  senderId: Address;
  amount: number;
  senderPublicKey: Buffer & As<'publicKey'>;
  requesterPublicKey?: Buffer & As<'publicKey'>;
  timestamp: number;
  fee: number;
  asset: AssetType;
  type: number;
  id: string;
  signature?: Buffer & As<'signature'>;
  signSignature?: Buffer & As<'signature'>;
  signatures?: Array<Buffer & As<'signature'>>;
};

export type PostableLiskTransaction<T> = Overwrite<LiskTransaction<T>, {
  amount: string,
  fee: string,
  senderPublicKey: string;
  requesterPublicKey?: string;
  signature?: string;
  signSignature?: string;
  signatures?: string[];
}>;

export abstract class BaseLiskCodec<T> implements IBaseTxCodec<LiskTransaction<T>, PostableLiskTransaction<T>> {
  public readonly identifier: string;
  public readonly type: number;
  public constructor(type: number, identifier: string) {
    this.type = type;
    this.identifier = identifier;
  }

  public calcBytes(tx: LiskTransaction<T>): Buffer {
    const assetBytes = this.assetBytes(tx);
    const bb         = new ByteBuffer(1 + 4 + 32 + 32 + 8 + 8 + 64 + 64 + assetBytes.length, true);
    bb.writeByte(tx.type);
    bb.writeUint32(tx.timestamp);
    bb.append(tx.senderPublicKey);
    if (!empty(tx.requesterPublicKey)) {
      bb.append(tx.requesterPublicKey);
    }
    if (!empty(tx.recipientId)) {
      bb.append(new Buffer(Long.fromString(tx.recipientId.slice(0, -1)).toBytesBE()));
    } else {
      bb.append(Buffer.alloc(8).fill(0));
    }

    // tslint:disable-next-line no-string-literal
    bb['writeLong'](tx.amount);

    bb.append(assetBytes);
    bb.flip();
    return new Buffer(bb.toBuffer());
  }

  public calcFullBytes(tx: LiskTransaction<T>): Buffer {
    return Buffer.concat([
      this.calcBytes(tx),
      ... [
        tx.signature,
        tx.signSignature,
        ... (tx.signatures || []),
        ]
          .filter((el) => !!el),
    ]);
  }

  public fromPostable(ptx: PostableLiskTransaction<T>): LiskTransaction<T> {
    const toRet: LiskTransaction<T> = {
      ...ptx,
      amount            : parseInt(`${ptx.amount}`, 10),
      fee               : parseInt(`${ptx.fee}`, 10),
      requesterPublicKey: (ptx.requesterPublicKey ? Buffer.from(ptx.requesterPublicKey, 'hex') : null) as Buffer & As<'publicKey'>,
      senderPublicKey   : (ptx.senderPublicKey ? Buffer.from(ptx.senderPublicKey, 'hex') : null) as Buffer & As<'publicKey'>,
      signSignature     : (ptx.signSignature ? Buffer.from(ptx.signSignature, 'hex') : null) as Buffer & As<'signature'>,
      signature         : (ptx.signature ? Buffer.from(ptx.signature, 'hex') : null) as Buffer & As<'signature'>,
      signatures        : (ptx.signatures ? ptx.signatures.map((s) => Buffer.from(s, 'hex')) : null) as Array<Buffer & As<'signature'>>,
    };

    ['requesterPublicKey', 'senderPublicKey', 'signSignature', 'signatures', 'signature']
      .forEach((k) => {
        if (toRet[k] === null) {
          delete toRet[k];
        }
      });

    return toRet;
  }

  public toPostable(tx: LiskTransaction<T>): PostableLiskTransaction<T> {
    const toRet: PostableLiskTransaction<T> = {
      ...tx,
      amount            : `${tx.amount}`,
      fee               : `${tx.fee}`,
      requesterPublicKey: tx.requesterPublicKey ? tx.requesterPublicKey.toString('hex') : null,
      senderPublicKey   : tx.senderPublicKey.toString('hex'),
      signSignature     : tx.signSignature ? tx.signSignature.toString('hex') : null,
      signature         : tx.signature.toString('hex'),
      signatures        : tx.signatures ? tx.signatures.map((s) => s.toString('hex')) : null,
    };

    ['requesterPublicKey', 'senderPublicKey', 'signSignature', 'signatures']
      .forEach((k) => {
        if (toRet[k] === null) {
          delete toRet[k];
        }
      });

    return toRet;
  }

  public transform(from: IBaseTx): LiskTransaction<T> {
    const toRet: LiskTransaction<T> = {
      amount            : 0,
      asset             : null,
      fee               : null,
      id                : null,
      recipientId       : null,
      requesterPublicKey: null,
      senderId          : null,
      senderPublicKey   : null,
      timestamp         : null,
      type              : null,
    };

    if (empty(from.fee)) {
      toRet.fee = this.calcFees(from);
    } else {
      toRet.fee = parseInt(from.fee, 10);
    }

    if (empty(from.sender.publicKey)) {
      throw new Error('Please set sender publicKey');
    }
    toRet.senderPublicKey = from.sender.publicKey;
    toRet.senderId        = from.sender.address || from.sender.address;

    if (!empty(from.nonce)) {
      toRet.timestamp = parseInt(from.nonce, 10);
    } else {
      toRet.timestamp = parseInt(this.createNonce(), 10);
    }

    // if (tx.kind === 'vote') {
    //   const votes: string[] = [];
    //   for (const pref of tx.preferences) {
    //     votes.push(`${pref.action}${pref.delegateIdentifier.toString('hex')}`);
    //   }
    //   toRet.asset = { votes } as any;
    // } else if (tx.kind === 'register-delegate') {
    //   toRet.asset = { delegate: { username: tx.identifier } } as any;
    // } else if (tx.kind === 'second-signature') {
    //   toRet.asset = { signature: { publicKey: tx.publicKey.toString('hex') } } as any;
    // } else if (tx.kind === 'multisignature') {
    //   toRet.asset = {
    //     multisignature: {
    //       keysgroup: tx.config.added
    //         .map((p) => `+${p.toString('hex')}`)
    //         .concat(tx.config.removed
    //           .map((p) => `-${p.toString('hex')}`)
    //         ),
    //       lifetime : tx.lifetime,
    //       min      : tx.min,
    //     },
    //   } as any;
    // } else if (tx.kind === 'send') {
    //   if (!empty(tx.memo)) {
    //     toRet.asset = { data: tx.memo } as any;
    //   }
    // }

    if (from.signature) {
      toRet.signature = from.signature;
    }
    if (from.extraSignatures) {
      if (from.extraSignatures.length === 1) {
        toRet.signSignature = from.extraSignatures[0];
      } else {
        toRet.signatures = from.extraSignatures;
      }
    }
    return toRet;
  }

  public abstract calcFees(tx: IBaseTx): number;

  public createNonce() {
    return `${Math.floor(
      (Date.now() - Date.UTC(2016, 4, 24, 17, 0, 0, 0)) / 1000
    )}` as string & As<'nonce'>;
  }

  public fromBytes(buff: Buffer): LiskTransaction<T> {
    throw new Error('Cant derive a lsk transaction from buffer inequivocably');
  }

  protected abstract assetBytes(tx: LiskTransaction<T>): Buffer;

}
