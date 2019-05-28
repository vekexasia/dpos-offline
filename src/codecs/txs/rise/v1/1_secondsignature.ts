import { IRegisterSecondSignature, ISendTx, LiskSecondSignatureAsset, LiskSendAsset } from '../../lisk';
import { RiseV2Transaction } from '../base_rise';
import { BaseRiseV1Codec } from './base_v1';

export class RiseSecondSignV1TxCodec extends BaseRiseV1Codec<LiskSecondSignatureAsset> {

  constructor() {
    super(1, 'second-signature');
  }

  public calcFees(tx: IRegisterSecondSignature): number {
    return 500000000;
  }

  public transform(from: IRegisterSecondSignature): RiseV2Transaction<LiskSecondSignatureAsset> {
    const s = super.transform(from);
    s.asset = { signature: { publicKey: from.publicKey.toString('hex') } };
    return s;
  }

  protected assetBytes(tx: RiseV2Transaction<LiskSecondSignatureAsset>): Buffer {
    return Buffer.from(tx.asset.signature.publicKey, 'hex');
  }

}
