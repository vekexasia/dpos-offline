import * as bech32 from 'bech32-buffer';
import * as ByteBuffer from 'bytebuffer';
import * as empty from 'is-empty';
import * as Long from 'long';
import { As } from 'type-tagger';
import { Omit, Overwrite } from 'utility-types';
import * as varuint from 'varuint-bitcoin';
import { toSha256 } from '../utils/sha256';
import {
  Address,
  IBaseTx,
  ICoinCodec,
  ICoinCodecTxs,
  IKeypair,
  ISendTx,
  IVoteTx, SenderType
} from './interface';
import {
  IRegisterSecondSignature, LiskCoinCodecMsgs,
} from './lisk';
import { Rise } from './rise';
import { toTransportable } from '../utils/toTransportable';

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

export type IRiseV2Transaction =
  IVoteTx<string>
  | Overwrite<ISendTx, { readonly memo?: Buffer | string }>
  | IRiseV2RegisterDelegateTx
  | IRegisterSecondSignature;

// tslint:disable-next-line
export type RiseV2SignOpts = { skipSignatures: boolean };
export type RiseV2CoinCodecTxs =
  ICoinCodecTxs<RiseV2Transaction<any>, IRiseV2Transaction, RiseV2SignOpts, PostableRiseV2Transaction<any>>
  & {
  getAddressBytes(address: Address): Buffer;
  getChildBytes(tx: RiseV2Transaction<any>): Buffer;
};

function encodeVote(username: string): Buffer {
  const usernameBuf = Buffer.from(username, 'utf8');
  return Buffer.concat([varuint.encode(usernameBuf.length), usernameBuf]);
}

export const RiseV2: ICoinCodec<RiseV2CoinCodecTxs, LiskCoinCodecMsgs> = {
  ...Rise,
  txs: {
    ...Rise.txs,
    _codec: null as any,
    createNonce() {
      return `${Math.floor(
        (Date.now() - Date.UTC(2016, 4, 24, 17, 0, 0, 0)) / 1000
      )}` as string & As<'nonce'>;
    },
    // tslint:disable-next-line max-line-length
    calcSignature(tx: RiseV2Transaction<any>, kp: IKeypair | string, opts: RiseV2SignOpts) {
      return this._codec.raw.sign(
        toSha256(this.bytes(tx, opts)),
        typeof(kp) === 'string' ? this._codec.deriveKeypair(kp) : kp
      );
    },
    // tslint:disable-next-line variable-name
    createAndSign(tx: Omit<IRiseV2Transaction, 'sender'> & { sender?: SenderType }, _kp: IKeypair | string, inRawFormat?: true) {
      const kp = typeof(_kp) === 'string' ? this._codec.deriveKeypair(_kp) : _kp;
      if (empty(tx.sender)) {
        tx.sender = {
          address  : this._codec.calcAddress(kp.publicKey),
          publicKey: kp.publicKey,
        };
      }
      const signableTx = this.transform(tx);
      const signedTx   = this.sign(signableTx, kp);
      if (inRawFormat) {
        return signedTx;
      }
      return this.toPostable(signedTx);
    },
    getAddressBytes(address: Address): Buffer {
      if (/[0-9]+R$/.test(address)) {
        return Rise.txs.getAddressBytes(address);
      }
      const res = bech32.decode(address);
      return Buffer.concat([
        Buffer.from(res.prefix, 'ascii'),
        new Buffer(res.data),
      ]);
    },
    getChildBytes(tx: RiseV2Transaction<any>): Buffer {
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
    },
    bytes(tx: RiseV2Transaction<any>, opts: RiseV2SignOpts): Buffer {
      const bb = new ByteBuffer(1024, true);

      function encodeVarUint(buf: Buffer) {
        return Buffer.concat([varuint.encode(buf.length), buf]);
      }

      bb.writeUint8(tx.type);
      bb.writeUint8(tx.version);
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
    },

    transform<T = any>(tx: IRiseV2Transaction, net: 'main' | 'test') {
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

      toRet.fee = tx.fee || this.baseFees[tx.kind];
      if (tx.kind === 'send' && parseInt(toRet.fee, 10) === this.baseFees[tx.kind]) {
        // Send has variable fee system.
        const memoLength        = tx.memo
          ? (Buffer.isBuffer(tx.memo) ? tx.memo : Buffer.from(tx.memo, 'utf8')).length
          : 0;
        toRet.fee = `${parseInt(toRet.fee, 10) + 1000000 * memoLength}`;
      }

      if (empty(tx.sender.publicKey)) {
        throw new Error('Please set sender publicKey');
      }
      toRet.senderPubData = Buffer.concat([new Buffer([1]), tx.sender.publicKey]) as Buffer & As<'pubData'>;
      toRet.senderId = tx.sender.address || this._codec.calcAddress(tx.sender.publicKey, net, 'v1');

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
        const added: string[] = tx.preferences
          .filter((a) => a.action === '+')
          .map((a) => a.delegateIdentifier);
        const removed: string[] = tx.preferences
          .filter((a) => a.action === '-')
          .map((a) => a.delegateIdentifier);
        toRet.asset = { added, removed } as any;
      } else if (tx.kind === 'register-delegate') {
        toRet.asset = {
          delegate: {
            forgingPK: tx.forgingPublicKey || tx.sender.publicKey,
            username: tx.identifier,
          },
        } as any;
      } else if (tx.kind === 'second-signature') {
        toRet.asset = { signature: { publicKey: tx.publicKey } } as any;
      }

      if (tx.signature) {
        toRet.signatures.push(tx.signature);
      }
      if (tx.extraSignatures) {
        toRet.signatures.push(... tx.extraSignatures);
      }

      return toRet;
    },

    // tslint:disable-next-line variable-name
    sign(tx: RiseV2Transaction<any>, _kp: IKeypair | string) {
      const kp     = typeof(_kp) === 'string' ? this._codec.deriveKeypair(_kp) : _kp;
      if (!tx.senderPubData) {
        tx.senderPubData = kp.publicKey;
      }
      tx.signatures = tx.signatures || [];
      tx.signatures.push(this.calcSignature(tx, kp, { skipSignatures: true }));
      tx.id        = this.identifier(tx);
      return tx;
    },

    verify(tx: RiseV2Transaction<any>, signature: Buffer & As<'signature'> = tx.signatures[0], pubKey: Buffer & As<'publicKey'|'pubData'> = tx.senderPubData): boolean {
      const hash              = toSha256(
        this.bytes(tx, { skipSignatures: true}));
      return this._codec.raw.verify(hash, signature, pubKey);
    },

    toPostable<T = any>(tx: RiseV2Transaction<T>): PostableRiseV2Transaction<T> {
      return toTransportable(tx);
    },

    fromPostable<T = any>(ptx: PostableRiseV2Transaction<T>): RiseV2Transaction<T> {
      const toRet: RiseV2Transaction<T> = {
        ...ptx,
        senderPubData     : (ptx.senderPubData ? Buffer.from(ptx.senderPubData, 'hex') : null) as Buffer & As<'publicKey'|'pubData'>,
        signatures        : (ptx.signatures ? ptx.signatures.map((s) => Buffer.from(s, 'hex')) : null) as Array<Buffer & As<'signature'>>,
      };
      const asset = ptx.asset as any;
      if (toRet.type === 10 && asset && asset.data) {
        asset.data = Buffer.from(asset.data, 'utf8');
      } else if (toRet.type === 11) {
        asset.signature.publicKey = Buffer.from(asset.signature.publicKey, 'hex');
      } else if (toRet.type === 12) {
        asset.delegate.forgingPK = Buffer.from(asset.signature.forgingPK, 'hex');
      }

      return toRet;
    },
    identifier(tx: RiseV2Transaction<any>) {
      if (tx.type < 0) {
        return Rise.txs.identifier.apply(this, tx);
      }
      const hash = toSha256(this.bytes(tx, {skipSignatures: false}));
      const temp = [];
      for (let i = 0; i < 8; i++) {
        temp.push(hash[7 - i]);
      }
      return Long.fromBytesBE(temp, true).toString() as string & As<'txIdentifier'>;
    },
  },

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
