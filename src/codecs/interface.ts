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
 * Codec Transactions type
 */
export interface ICoinCodecTxs<T, K extends {sender?: SenderType, kind: string}, PostableFormat = any> {
  /**
   * The hosting codec object
   */
  _codec: ICoinCodec<this, any>;

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
   */
  bytes(tx: T): Buffer;

  /**
   * Computes signature of a transaction using provided credentials
   * @param tx The transaction object
   * @param kp keypair or secret in string format
   */
  calcSignature(tx: T, kp: IKeypair | string): Buffer & As<'signature'>;

  /**
   * Signs (Modifies) transaction with provided credentials
   * @param tx The transaction object
   * @param kp keypair or secret in string format
   */
  sign(tx: T, kp: IKeypair | string): T;

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
