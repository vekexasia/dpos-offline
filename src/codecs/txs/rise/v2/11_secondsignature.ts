import { As } from 'type-tagger';
import { IRegisterSecondSignature } from '../../lisk';
import { BaseRiseV2Codec, RiseV2Transaction } from './base_v2';
import { Overwrite } from 'utility-types';

// tslint:disable-next-line
export type RiseV2SecondSignatureAsset = {
  signature: {
    publicKey: Buffer & As<'publicKey'>
  }
};

export type IRegisterSecondSignatureRiseV2Tx = Overwrite<IRegisterSecondSignature, {
  identifier: 'second-signature-v2'
}>;

export class RiseSecondSignV2TxCodec extends BaseRiseV2Codec<RiseV2SecondSignatureAsset> {

  constructor() {
    super(11, 'second-signature-v2');
  }

  public transform(from: IRegisterSecondSignature): RiseV2Transaction<RiseV2SecondSignatureAsset> {
    return {
      ... super.transform(from),
      asset: {
        signature: {
          publicKey: from.publicKey,
        },
      }
    };
  }

  public calcFees(tx: IRegisterSecondSignature): number {
    return 500000000;
  }

  protected assetBytes(tx: RiseV2Transaction<RiseV2SecondSignatureAsset>): Buffer {
    return tx.asset.signature.publicKey;
  }

  protected assetFromBytes(buf: Buffer): RiseV2SecondSignatureAsset {
    return {
      signature: {
        publicKey: buf as Buffer & As<'publicKey'>,
      },
    };
  }

}
