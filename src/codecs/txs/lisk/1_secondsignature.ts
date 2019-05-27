import { As } from 'type-tagger';
import { IBaseTx } from '../base';
import { BaseLiskCodec, LiskTransaction } from './base_lisk';

export interface IRegisterSecondSignature extends IBaseTx {
  readonly kind: 'second-signature';
  readonly publicKey: Buffer & As<'publicKey'>;
}

// tslint:disable-next-line
export type LiskSecondSignatureAsset = { signature: { publicKey: string } };

export class LiskSecondSignTxCodec extends BaseLiskCodec<LiskSecondSignatureAsset> {

  constructor() {
    super(1, 'second-signature');
  }

  public calcFees(tx: IRegisterSecondSignature): number {
    return 500000000;
  }

  public transform(from: IRegisterSecondSignature): LiskTransaction<LiskSecondSignatureAsset> {
    const s = super.transform(from);
    s.asset = { signature: { publicKey: from.publicKey.toString('hex') } };
    return s;
  }

  protected assetBytes(tx: LiskTransaction<LiskSecondSignatureAsset>): Buffer {
    return Buffer.from(tx.asset.signature.publicKey, 'hex');
  }

}
