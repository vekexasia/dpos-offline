import { As } from 'type-tagger';
import { Omit, Overwrite } from 'utility-types';

export type Address = string & As<'address'>;
export type RecipientId = Address;

export interface IKeypair {
  readonly publicKey: Buffer & As<'publicKey'>;
  readonly privateKey: Buffer & As<'privateKey'>;
}

// tslint:disable-next-line
export type SenderType = { publicKey?: Buffer & As<'publicKey'>, address?: Address };

export interface IBaseTx {
  readonly fee?: string;
  readonly nonce?: string & As<'nonce'>;
  sender: SenderType;
  signature?: Buffer;
  extraSignatures?: Buffer[];
}

export interface ISendTx extends IBaseTx {
  readonly kind: 'send';
  readonly amount: string;
  readonly recipient: RecipientId;
  readonly memo?: string;
}

export interface IVoteItem {
  delegateIdentifier: Buffer & As<'publicKey'>;
  weight?: string;
  action: '-' | '+';
}

export interface IVoteTx extends IBaseTx {
  readonly kind: 'vote';
  readonly preferences: IVoteItem[];
}

export interface IRegisterDelegateTx extends IBaseTx {
  readonly kind: 'register-delegate';
  readonly name: string & As<'delegateName'>;
}

export type ITransaction = IVoteTx | ISendTx | IRegisterDelegateTx;

export interface ICoinCodecTxs<T, K extends {sender: SenderType, kind: string}, SignOptions, PostableFormat = any> {
  _codec: ICoinCodec<this, any>;
  baseFees: {[k in K['kind']]: number};
  createNonce(): string & As<'nonce'>;
  transform(tx: K): T;
  bytes(tx: T, opts?: SignOptions): Buffer;
  calcSignature(tx: T, kp: IKeypair | string, signOpts?: SignOptions): Buffer & As<'signature'>;
  sign(tx: T, kp: IKeypair | string, signOpts?: SignOptions): T;
  verify(tx: T, signature?: Buffer & As<'signature'>, pubKey?: Buffer & As<'publicKey'>): boolean;
  createAndSign(tx: Omit<K, 'sender'> & { sender?: SenderType}, kp: IKeypair | string): T;
  // tslint:disable-next-line max-line-length
  createAndSign(tx: Omit<K, 'sender'> & { sender?: SenderType}, kp: IKeypair | string, inPostableFormat: true): PostableFormat;
  toPostable(tx: T): PostableFormat;
  fromPostable(tx: PostableFormat): T;
  identifier(tx: T): string & As<'txIdentifier'>;
}

export interface ICoinCodecMsgs {
  _codec: ICoinCodec<any, this>;
  sign: (msg: Buffer | string, kp: IKeypair) => Buffer & As<'signature'>;
  verify: (msg: Buffer | string, signature: Buffer & As<'signature'>, publicKey: Buffer & As<'publicKey'>) => boolean;
}

export interface ICoinCodec<TXs extends ICoinCodecTxs<any, any, any>, MSGs extends ICoinCodecMsgs> {
  deriveKeypair: (secret: Buffer | string) => IKeypair;
  calcAddress: (publicKey: (Buffer | string) & As<'publicKey'>) => Address;
  txs: TXs;
  msgs: MSGs;
  raw: {
    sign: (buf: Buffer, kp: IKeypair) => Buffer & As<'signature'>;
    verify: (bytes: Buffer, signature: Buffer & As<'signature'>, publicKey: Buffer & As<'publicKey'>) => boolean;
  };
}
