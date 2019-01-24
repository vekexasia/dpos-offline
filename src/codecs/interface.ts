import { As } from 'type-tagger';

/**
 * An Address.
 */
export type Address = string & As<'address'>;
/**
 * A recipient address
 */
export type RecipientId = Address;

/**
 * Holds public and private key.
 */
export interface IKeypair {
  readonly publicKey: Buffer & As<'publicKey'>;
  readonly privateKey: Buffer & As<'privateKey'>;
}

/**
 * SenderType is used to identify a sender.
 */
// tslint:disable-next-line
export type SenderType = { publicKey?: Buffer & As<'publicKey'>, address?: Address };

/**
 * Base Transaction interface
 */
export interface IBaseTx {
  /**
   * Fees. (Optional If Codec supports auto-fee-assign)
   */
  readonly fee?: string;
  /**
   * Transaction nonce. (In Lisk/Rise it's timestamp) in string format
   */
  readonly nonce?: string & As<'nonce'>;
  /**
   * Sender of this transaction
   */
  sender?: SenderType;
  /**
   * The Existing (if so) signature of such tx.
   */
  signature?: Buffer & As<'signature'>;
  /**
   * The existing extra signatures of such tx.
   */
  extraSignatures?: Array<Buffer & As<'signature'>>;
}

/**
 * Identifies a Send transaction
 */
export interface ISendTx extends IBaseTx {
  readonly kind: 'send';
  /**
   * Amount in Satoshi encoded as string
   */
  readonly amount: string;
  /**
   * Amount recipient
   */
  readonly recipient: RecipientId;
  /**
   * Optional Memo data. (If supported by the Coin)
   */
  readonly memo?: string;
}

/**
 * Voting Item for the Vote Transaction interface
 */
export interface IVoteItem<IDentifier> {
  /**
   * The identifier of the delegate to vote/unvoite
   */
  delegateIdentifier: IDentifier;
  /**
   * An optional vote weight to assign to the delegate. (If the coin supports it)
   */
  weight?: string;
  /**
   * The action to perform + => vote, - => unvote
   */
  action: '-' | '+';
}

/**
 * Vote transaction identifier
 */
export interface IVoteTx<IDentifier = Buffer & As<'publicKey'>> extends IBaseTx {
  readonly kind: 'vote';
  /**
   * Preference array of the votes to perform
   */
  readonly preferences: Array<IVoteItem<IDentifier>>;
}

/**
 * Register Delegate Identifier
 */
export interface IRegisterDelegateTx extends IBaseTx {
  readonly kind: 'register-delegate';
  /**
   * The identifier/username/name of the delegate to register
   */
  readonly identifier: string & As<'delegateName'>;
}

/**
 * Codec Transactions type
 */
export interface ICoinCodecTxs<T, K extends {sender?: SenderType, kind: string}, SignOptions, PostableFormat = any> {
  /**
   * The hosting codec object
   */
  _codec: ICoinCodec<this, any>;

  /**
   * The base fees for each transaction kind
   */
  baseFees: {[k in K['kind']]: number};

  /**
   * Create a nonces (If supported by codec)
   */
  createNonce(): string & As<'nonce'>;

  /**
   * Transforms a generic transaction interface object to an inner transaction type to be used for future operations
   * such as signing, verification ...
   * @param tx the tx to transform
   * @param args extra opts args.
   */
  transform(tx: K, ...args: any[]): T;

  /**
   * Computes the bytes of such transaction
   * @param tx transaction to compute bytes from
   * @param opts optiona options to be used when calculating bytes.
   */
  bytes(tx: T, opts?: SignOptions): Buffer;

  /**
   * Computes signature of a transaction using provided credentials
   * @param tx The transaction object
   * @param kp keypair or secret in string format
   * @param signOpts optional signing options
   */
  calcSignature(tx: T, kp: IKeypair | string, signOpts?: SignOptions): Buffer & As<'signature'>;

  /**
   * Signs (Modifies) transaction with provided credentials
   * @param tx The transaction object
   * @param kp keypair or secret in string format
   * @param signOpts optional signing options
   */
  sign(tx: T, kp: IKeypair | string, signOpts?: SignOptions): T;

  /**
   * Verifies transaction signature
   * @param tx The transaction object
   * @param signature Signature
   * @param pubKey Public key
   */
  verify(tx: T, signature?: Buffer & As<'signature'>, pubKey?: Buffer & As<'publicKey'>): boolean;

  /**
   * Creates and signs
   * @param tx The transaction pojo
   * @param kp keypair or secret in string format
   * @param inRawFormat true Optional. If provided the returning object will be not in postable format
   */
  createAndSign(tx: K, kp: IKeypair | string): PostableFormat;
  // tslint:disable-next-line max-line-length
  createAndSign(tx: K, kp: IKeypair | string, inRawFormat: true): T;

  /**
   * Converts a tx from internal to postable format
   * @param tx
   */
  toPostable(tx: T): PostableFormat;

  /**
   * Converts a tx from postable to internal format
   * @param tx
   */
  fromPostable(tx: PostableFormat): T;

  /**
   * Computes and returns the transaction identifier
   * @param tx
   */
  identifier(tx: T): string & As<'txIdentifier'>;
}

/**
 * Messages Codec structure
 */
export interface ICoinCodecMsgs {
  /**
   * The hosting codec
   */
  _codec: ICoinCodec<any, this>;

  /**
   * Encodes and signs the given message with th provided credentials
   * @param msg Message in buffer or string format
   * @param kp keypair or secret in string format
   */
  sign: (msg: Buffer | string, kp: IKeypair) => Buffer & As<'signature'>;

  /**
   * Verifies the signature of given message
   * @param msg Original signed message
   * @param signature Signature buffer
   * @param publicKey Public key buffer
   */
  verify: (msg: Buffer | string, signature: Buffer & As<'signature'>, publicKey: Buffer & As<'publicKey'>) => boolean;
}

/**
 * Coin Codec interface
 */
export interface ICoinCodec<TXs extends ICoinCodecTxs<any, any, any>, MSGs extends ICoinCodecMsgs> {

  /**
   * Transactions namespace
   */
  txs: TXs;

  /**
   * Messages Namespace
   */
  msgs: MSGs;

  /**
   * Raw utilities for low level stuff
   */
  raw: {
    /**
     * Low level signing method
     */
    sign(buf: Buffer, kp: IKeypair): Buffer & As<'signature'>;
    /**
     * Low level verify method
     */
    verify(bytes: Buffer, signature: Buffer & As<'signature'>, publicKey: Buffer & As<'publicKey'>): boolean;
  };

  /**
   * Creates keypair object from given secret
   * @param secret
   */
  deriveKeypair(secret: Buffer | string): IKeypair;

  /**
   * Calculates address from publicKey
   * @param publicKey
   * @param args extra arguments
   */
  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>, ...args: any[]): Address;
}
