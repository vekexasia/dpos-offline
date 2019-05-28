import { As } from 'type-tagger';
import { IBaseTx } from '../../base';
import { RiseV2Transaction } from '../base_rise';
import { BaseRiseV2Codec } from './base_v2';

// tslint:disable-next-line
export type RiseV2RegDelegateAsset = {
  delegate: {
    forgingPK: Buffer & As<'publicKey'>,
    username?: string
  }
};

/**
 * Register Delegate Identifier
 */
export interface IRegisterDelegateRiseV2Tx extends IBaseTx {
  readonly kind: 'register-delegate-v2';
  /**
   * The identifier/username/name of the delegate to register
   */
  readonly identifier?: string & As<'delegateName'>;
  readonly forgingPublicKey?: Buffer & As<'publicKey'>;
}

export class RiseRegDelegateV2TxCodec extends BaseRiseV2Codec<RiseV2RegDelegateAsset> {

  constructor() {
    super(12, 'register-delegate-v2');

  }
  public transform(from: IRegisterDelegateRiseV2Tx): RiseV2Transaction<RiseV2RegDelegateAsset> {
    const asset: RiseV2RegDelegateAsset = {
      delegate: {
        forgingPK: from.forgingPublicKey || from.sender.publicKey,
        username: from.identifier,
      },
    };

    if (!asset.delegate.username) {
      delete asset.delegate.username;
    }

    return {
      ... super.transform(from),
      asset,
    };
  }

  public calcFees(tx: IRegisterDelegateRiseV2Tx): number {
    return 2500000000;
  }

  protected assetBytes(tx: RiseV2Transaction<RiseV2RegDelegateAsset>): Buffer {
    return Buffer.concat([
      tx.asset.delegate.forgingPK,
      Buffer.from(tx.asset.delegate.username || '', 'utf8'),
    ]);
  }

  protected assetFromBytes(buf: Buffer): RiseV2RegDelegateAsset {
    const forgingPK = buf.slice(0, 32) as Buffer & As<'publicKey'>;
    const username = buf.length === 32 ? null : buf.slice(32).toString('utf8');

    return {
      delegate: {
        forgingPK,
        username,
      },
    };
  }

}
