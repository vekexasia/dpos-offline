import * as ByteBuffer from 'bytebuffer';
import {BaseTx} from './BaseTx';

export interface IMultiSignatureAssetType {
  multisignature: { min: number, keysgroup: any[], lifetime: number };
}

/**
 * Multi signature transaction.
 */
export class MultiSignatureTx extends BaseTx<IMultiSignatureAssetType> {
  public type: number = 4;
  public amount       = 0;

  constructor(asset?: IMultiSignatureAssetType) {
    super(asset);
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer {
    const keyGroupBuf = Buffer.from(this.asset.multisignature.keysgroup.join(''), 'utf8');
    const bb          = new ByteBuffer(1 + 1 + keyGroupBuf.length, true);
    bb.writeByte(this.asset.multisignature.min);
    bb.writeByte(this.asset.multisignature.lifetime);
    // tslint:disable-next-line prefer-for-of
    for (let i = 0; i < keyGroupBuf.length; i++) {
      bb.writeByte(keyGroupBuf[i]);
    }
    bb.flip();
    return bb.toBuffer() as any;
  }
}
