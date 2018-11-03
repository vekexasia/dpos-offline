import { As } from 'type-tagger';

export type Address = string & As<'address'>;
export type RecipientId = Address;

export interface IKeypair {
  readonly publicKey: Buffer & As<'publicKey'>;
  readonly privateKey: Buffer & As<'privateKey'>;
}

export interface IBaseTx {
  readonly fee?: string;
  readonly nonce?: string & As<'nonce'>;
  sender: { publicKey?: Buffer & As<'publicKey'>, address?: Address};
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

export interface ICoinCodec<T, K extends {kind: string}, SignOptions> {
  readonly baseFees: {[k in K['kind']]: number};
  readonly deriveKeypair: (secret: Buffer | string) => IKeypair;
  readonly calcAddress: (publicKey: (Buffer | string) & As<'publicKey'>) => Address;
  readonly txs: {
    readonly createNonce: () => string & As<'nonce'>;
    readonly transform: (tx: K) => T;
    readonly bytes: (tx: T, opts?: SignOptions) => Buffer;
    readonly calcSignature: (tx: T, kp: IKeypair, signOpts?: SignOptions) => Buffer & As<'signature'>;
    readonly sign: (tx: T, kp: IKeypair, signOpts?: SignOptions) => T;
    readonly postableData: (tx: T) => any;
    readonly identifier: (tx: T) => string & As<'txIdentifier'>;
    [k: string]: any;
  };
  readonly msgs: {
    readonly sign: (msg: Buffer | string, kp: IKeypair) => Buffer & As<'signature'>;
    readonly verify: (msg: Buffer | string, signature: Buffer & As<'signature'>, publicKey: Buffer & As<'publicKey'>) => boolean;
    [k: string]: any;
  };
  readonly raw: {
    readonly sign: (buf: Buffer, kp: IKeypair) => Buffer & As<'signature'>;
    readonly verify: (bytes: Buffer, signature: Buffer & As<'signature'>, publicKey: Buffer & As<'publicKey'>) => boolean;
    [k: string]: any;
  };
  [k: string]: any;
}
