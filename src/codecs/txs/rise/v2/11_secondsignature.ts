import { As } from 'type-tagger';
import { Overwrite } from 'utility-types';
import { IRegisterSecondSignature } from '../../lisk';
import { RiseV2Transaction } from '../base_rise';
import { BaseRiseV2Codec } from './base_v2';

// tslint:disable-next-line
export type RiseV2SecondSignatureAsset = {
  signature: {
    publicKey: Buffer & As<'publicKey'>
  }
};

export type IRegisterSecondSignatureRiseV2Tx = Overwrite<IRegisterSecondSignature, {
  kind: 'second-signature-v2'
}>;

export class RiseSecondSignV2TxCodec extends BaseRiseV2Codec<RiseV2SecondSignatureAsset> {

  constructor() {
    super(11, 'second-signature-v2');
  }

  public transform(from: IRegisterSecondSignatureRiseV2Tx): RiseV2Transaction<RiseV2SecondSignatureAsset> {
    return {
      ... super.transform(from),
      asset: {
        signature: {
          publicKey: from.publicKey,
        },
      },
    };
  }

  public calcFees(tx: IRegisterSecondSignatureRiseV2Tx): number {
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
