import * as bech32 from 'bech32-buffer';
import * as ByteBuffer from 'bytebuffer';
import * as empty from 'is-empty';
import * as Long from 'long';
import { As } from 'type-tagger';
import { Omit, Overwrite } from 'utility-types';
import * as varuint from 'varuint-bitcoin';
import { toSha256 } from '../utils/sha256';
import { toTransportable } from '../utils/toTransportable';
import { Address, IBaseTx, ICoinCodec, ICoinCodecTxs, IKeypair, ISendTx, IVoteTx, SenderType } from './interface';
import { IRegisterSecondSignature, LiskCoinCodecMsgs, } from './lisk';
import { Rise, RiseTransaction } from './rise';
// tslint:disable max-line-length
// tslint:disable-next-line
export type RiseV2Transaction<AssetType> = {
  recipientId: Address;
  senderId: Address;
  amount: string;
  senderPubData: Buffer & As<'publicKey' | 'pubData'>;
  timestamp: number;
  fee: string;
  asset: AssetType;
  type: number;
  id: string;
  version: number;
  signatures: Array<Buffer & As<'signature'>>;
};
export type PostableRiseV2Transaction<T> = Overwrite<RiseV2Transaction<T>, {
  senderPubData: string;
  signatures: string[];
}>;

/**
 * Register Delegate Identifier
 */
export interface IRiseV2RegisterDelegateTx extends IBaseTx {
  readonly kind: 'register-delegate';
  /**
   * The identifier/username/name of the delegate to register
   */
  readonly identifier?: string & As<'delegateName'>;
  readonly forgingPublicKey?: Buffer & As<'publicKey'>;
}

export type IRiseV2Transaction =  IVoteTx<string>
  | Overwrite<ISendTx, { readonly memo?: Buffer | string }>
  | IRiseV2RegisterDelegateTx
  | IRegisterSecondSignature;

// tslint:disable-next-line
export type RiseV2SignOpts = { skipSignatures: boolean };

export interface IRiseV2CoinCodecTxs extends ICoinCodecTxs<RiseV2Transaction<any>, IRiseV2Transaction, RiseV2SignOpts, PostableRiseV2Transaction<any>> {
  getAddressBytes(address: Address): Buffer;

  getChildBytes(tx: RiseV2Transaction<any>): Buffer;
}

function encodeVote(username: string): Buffer {
  const usernameBuf = Buffer.from(username, 'utf8');
  return Buffer.concat([varuint.encode(usernameBuf.length), usernameBuf]);
}

function isAddressV2(addr: Address): boolean {
  return !/[0-9]+R/.test(addr);
}

export class RiseV2Txs implements IRiseV2CoinCodecTxs {

  // tslint:disable-next-line
  public _codec: ICoinCodec<this, any>;

  public readonly baseFees = {
    'register-delegate': 2500000000,
    'second-signature': 500000000,
    'send': 10000000,
    'sendMultiplier': 1000000,
    'vote': 100000000,
  };

  public bytes(tx: RiseV2Transaction<any>, opts: RiseV2SignOpts = { skipSignatures: false }): Buffer {
    if (this.isTxOldType(tx.type)) {
      return Rise.txs.bytes(
        this.toV1Format(tx),
        { skipSignature: opts.skipSignatures, skipSecondSign: opts.skipSignatures }
      );
    }
    const bb = new ByteBuffer(1024, true);

    function encodeVarUint(buf: Buffer) {
      return Buffer.concat([varuint.encode(buf.length), buf]);
    }

    bb.writeUint8(tx.type);
    bb.writeUint32(tx.version);
    bb.writeUint32(tx.timestamp);

    bb.append(encodeVarUint(tx.senderPubData));
    bb.append(encodeVarUint(tx.recipientId ? this.getAddressBytes(tx.recipientId) : Buffer.alloc(0)));

    // TODO: use some arbitrary precision lib to serialize it into a buff
    bb.writeUint64(parseInt(tx.amount, 10));
    bb.writeUint64(parseInt(tx.fee, 10));

    bb.append(encodeVarUint(this.getChildBytes(tx)));
    if (!opts.skipSignatures) {
      bb.append(Buffer.concat(tx.signatures));
    }

    bb.flip();
    return new Buffer(bb.toBuffer());
  }

  public calcSignature(tx: RiseV2Transaction<any>, kp: IKeypair | string, signOpts?: RiseV2SignOpts): Buffer & As<'signature'> {
    return this._codec.raw.sign(
      toSha256(this.bytes(tx, signOpts)),
      typeof (kp) === 'string' ? this._codec.deriveKeypair(kp) : kp
    );
  }
  public createAndSign(tx: IRiseV2Transaction, kp: IKeypair | string): PostableRiseV2Transaction<any>;
  public createAndSign(tx: IRiseV2Transaction, kp: IKeypair | string, inRawFormat: true): RiseV2Transaction<any>;
  public createAndSign(tx: IRiseV2Transaction, kp: IKeypair | string, net: 'main'|'test', inRawFormat?: true): RiseV2Transaction<any>;

  // tslint:disable-next-line variable-name
  public createAndSign(tx: IRiseV2Transaction, _kp: IKeypair | string, net?: 'main'|'test'|true, inRawFormat?: true): PostableRiseV2Transaction<any> | RiseV2Transaction<any> {
    const kp = typeof (_kp) === 'string' ? this._codec.deriveKeypair(_kp) : _kp;
    if (!net) {
      net = 'main';
    }
    if (net === true) {
      net = 'main';
      inRawFormat = true;
    }

    if (empty(tx.sender)) {
      tx.sender = {
        address  : this._codec.calcAddress(kp.publicKey, net),
        publicKey: kp.publicKey,
      };
    }

    const signableTx = this.transform(tx, net);
    const signedTx   = this.sign(signableTx, kp);
    if (inRawFormat) {
      return signedTx;
    }
    return this.toPostable(signedTx);
  }

  public createNonce(): string & As<'nonce'> {
    return `${Math.floor(
      (Date.now() - Date.UTC(2016, 4, 24, 17, 0, 0, 0)) / 1000
    )}` as string & As<'nonce'>;
  }

  public fromPostable<T>(ptx: PostableRiseV2Transaction<any>): RiseV2Transaction<T> {
    const toRet: RiseV2Transaction<T> = {
      ...ptx,
      senderPubData: (ptx.senderPubData ? Buffer.from(ptx.senderPubData, 'hex') : null) as Buffer & As<'publicKey' | 'pubData'>,
      signatures   : (ptx.signatures ? ptx.signatures.map((s) => Buffer.from(s, 'hex')) : null) as Array<Buffer & As<'signature'>>,
    };
    const asset                       = ptx.asset as any;
    if (toRet.type === 10 && asset && asset.data) {
      asset.data = Buffer.from(asset.data, 'utf8');
    } else if (toRet.type === 11) {
      asset.signature.publicKey = Buffer.from(asset.signature.publicKey, 'hex');
    } else if (toRet.type === 12) {
      asset.delegate.forgingPK = Buffer.from(asset.signature.forgingPK, 'hex');
    }

    return toRet;
  }

  public getAddressBytes(address: Address): Buffer {
    if (!isAddressV2(address)) {
      return Rise.txs.getAddressBytes(address);
    }
    // TODO: Check address invalidity.
    const res = bech32.decode(address);
    return Buffer.concat([
      Buffer.from(res.prefix, 'ascii'),
      new Buffer(res.data),
    ]);
  }

  public getChildBytes(tx: RiseV2Transaction<any>): Buffer {
    if (tx.type === 10 || tx.type === 0) {
      if (tx.asset && tx.asset.data) {
        return tx.asset.data;
      }
      return Buffer.alloc(0);
    } else if (tx.type === 11 || tx.type === 1) {
      return tx.asset.signature.publicKey;
    } else if (tx.type === 12 || tx.type === 2) {
      if (tx.type === 2) {
        return Buffer.from(tx.asset.delegate.username, 'utf8');
      }
      // else it's ne new.
      return Buffer.concat([
        tx.asset.delegate.forgingPK,
        Buffer.from(tx.asset.delegate.username || '', 'utf8'),
      ]);
    } else if (tx.type === 13 || tx.type === 3) {
      if (tx.type === 3) {
        return Buffer.from(tx.asset.votes.join(''), 'utf8');
      }
      return Buffer.concat([
        varuint.encode(tx.asset.added.length),
        ...tx.asset.added.map(encodeVote),
        varuint.encode(tx.asset.removed.length),
        ...tx.asset.removed.map(encodeVote),
      ]);
    }
    return Buffer.alloc(0);
  }

  public identifier(tx: RiseV2Transaction<any>): string & As<'txIdentifier'> {
    if (this.isTxOldType(tx.type)) {
      return Rise.txs.identifier.call(this, this.toV1Format(tx));
    }
    const hash = toSha256(this.bytes(tx, { skipSignatures: false }));
    const temp = [];
    for (let i = 0; i < 8; i++) {
      temp.push(hash[7 - i]);
    }
    return Long.fromBytesBE(temp, true).toString() as string & As<'txIdentifier'>;
  }

  // tslint:disable-next-line variable-name
  public sign(tx: RiseV2Transaction<any>, _kp: IKeypair | string, signOpts?: RiseV2SignOpts): RiseV2Transaction<any> {
    const kp = typeof (_kp) === 'string' ? this._codec.deriveKeypair(_kp) : _kp;
    if (!tx.senderPubData) {
      if ([0, 1, 2, 3].indexOf(tx.type) !== -1) {
        tx.senderPubData = kp.publicKey;
      } else {
        tx.senderPubData = Buffer.concat([new Buffer([1]), kp.publicKey]) as Buffer & As<'publicKey'>;
      }
    }
    tx.signatures = tx.signatures || [];
    tx.signatures.push(this.calcSignature(tx, kp, { skipSignatures: true }));
    tx.id = this.identifier(tx);
    return tx;
  }

  public toPostable(tx: RiseV2Transaction<any>): PostableRiseV2Transaction<any> {
    return toTransportable(tx);
  }

  public transform<T = any>(tx: IRiseV2Transaction, net: 'main' | 'test'): RiseV2Transaction<T> {
    const toRet: RiseV2Transaction<T> = {
      amount       : '0',
      asset        : null,
      fee          : null,
      id           : null,
      recipientId  : null,
      senderId     : null,
      senderPubData: null,
      signatures   : [],
      timestamp    : null,
      type         : null,
      version      : 0,
    };
    toRet.type                        = ['send', 'second-signature', 'register-delegate', 'vote']
      .indexOf(tx.kind) + 10;

    if (toRet.type === 10 - 1) {
      throw new Error('Unsupported transaction type');
    }

    if (tx.kind === 'send') {
      toRet.amount = tx.amount;
    }

    toRet.fee = tx.fee || `${this.baseFees[tx.kind]}`;
    if (tx.kind === 'send' && parseInt(toRet.fee, 10) === this.baseFees[tx.kind]) {
      // Send has variable fee system.
      const memoLength = tx.memo
        ? (Buffer.isBuffer(tx.memo) ? tx.memo : Buffer.from(tx.memo, 'utf8')).length
        : 0;
      toRet.fee        = `${parseInt(toRet.fee, 10) + this.baseFees.sendMultiplier * memoLength}`;
    }

    if (empty(tx.sender.publicKey)) {
      throw new Error('Please set sender publicKey');
    }

    toRet.senderId      = tx.sender.address || this._codec.calcAddress(tx.sender.publicKey, net, 'v1');
    toRet.senderPubData = isAddressV2(toRet.senderId)
      ? Buffer.concat([new Buffer([1]), tx.sender.publicKey]) as Buffer & As<'pubData'>
      : tx.sender.publicKey;

    if (tx.kind === 'send') {
      toRet.recipientId = tx.recipient;
    }

    if (!empty(tx.nonce)) {
      toRet.timestamp = parseInt(tx.nonce, 10);
    } else {
      toRet.timestamp = parseInt(this.createNonce(), 10);
    }

    if (tx.kind === 'send' && !empty(tx.memo)) {
      toRet.asset = { data: Buffer.isBuffer(tx.memo) ? tx.memo : Buffer.from(tx.memo, 'utf8') } as any;
    } else if (tx.kind === 'vote') {
      const added: string[]   = tx.preferences
        .filter((a) => a.action === '+')
        .map((a) => a.delegateIdentifier);
      const removed: string[] = tx.preferences
        .filter((a) => a.action === '-')
        .map((a) => a.delegateIdentifier);
      toRet.asset             = { added, removed } as any;
    } else if (tx.kind === 'register-delegate') {
      toRet.asset = {
        delegate: {
          forgingPK: tx.forgingPublicKey || tx.sender.publicKey,
          username : tx.identifier,
        },
      } as any;
      if (!tx.identifier) {
        delete (toRet.asset as any).delegate.username;
      }
    } else if (tx.kind === 'second-signature') {
      toRet.asset = { signature: { publicKey: tx.publicKey } } as any;
    }

    if (tx.signature) {
      toRet.signatures.push(tx.signature);
    }
    if (tx.extraSignatures) {
      toRet.signatures.push(...tx.extraSignatures);
    }

    return toRet;
  }

  public verify(tx: RiseV2Transaction<any>, signature?: Buffer & As<'signature'>, pubKey?: Buffer & As<'publicKey'>): boolean {
    const hash = toSha256(
      this.bytes(tx, { skipSignatures: true }));
    return this._codec.raw.verify(hash, signature, pubKey);
  }

  public fromV1Format<T>(tx: RiseTransaction<T>): RiseV2Transaction<T> {
    const asset: any = tx.asset;
    if (tx.type === 1 || tx.type === 11) {
      asset.signature.publicKey = Buffer.from(asset.signature.publicKey, 'hex');
    }

    return {
      amount: `${tx.amount}`,
      asset,
      fee: `${tx.fee}`,
      id: tx.id,
      recipientId: tx.recipientId,
      senderId: tx.senderId,
      senderPubData: tx.senderPublicKey,
      signatures: [
        tx.signature,
        tx.signSignature,
        ...tx.signatures,
      ]
        .filter((s) => typeof(s) !== 'undefined' && s !== null),
      timestamp: tx.timestamp,
      type: tx.type,
      version: 0,
    };
  }

  public toV1Format<T>(tx: RiseV2Transaction<T>): RiseTransaction<T> {
    return {
      ...tx,
      amount: parseInt(tx.amount, 10),
      fee: parseInt(tx.fee, 10),
      senderPublicKey: tx.senderPubData as Buffer & As<'publicKey'>,
      signSignature: tx.signatures[1],
      signature: tx.signatures[0],
    };
  }

  public isTxOldType(type: number): boolean {
    return type < 10;
  }
}

export const RiseV2: ICoinCodec<RiseV2Txs, LiskCoinCodecMsgs> = {
  ...Rise,
  txs: new RiseV2Txs(),

  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>, net: 'main' | 'test' = 'main', type: 'v0' | 'v1' = 'v1') {
    if (type === 'v0') {
      return Rise.calcAddress(publicKey);
    }
    const doubleSHA = toSha256(toSha256(Buffer.isBuffer(publicKey) ? publicKey : Buffer.from(publicKey, 'hex')));
    return bech32.encode(
      net === 'main' ? 'rise' : 'tise',
      Buffer.concat([
        Buffer.from([1]),
        doubleSHA,
      ])
    ) as string & As<'address'>;
  },

};

RiseV2.msgs._codec = RiseV2;
RiseV2.txs._codec  = RiseV2;
