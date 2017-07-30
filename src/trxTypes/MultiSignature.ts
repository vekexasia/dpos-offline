import {BaseTx} from './BaseTx';
import * as ByteBuffer from "bytebuffer";

export interface MultiSignatureAssetType {
  multisignature: { min: number, keysgroup: any[], lifetime: number }
}

/**
 * Multi signature transaction.
 */
export class MultiSignatureTx extends BaseTx<MultiSignatureAssetType> {
  type: number = 4;
  amount       = 0;

  constructor(asset?: MultiSignatureAssetType) {
    super(asset);
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer {
    const keyGroupBuf = Buffer.from(this.asset.multisignature.keysgroup.join(''), 'utf8');
    const bb          = new ByteBuffer(1 + 1 + keyGroupBuf.length, true);
    bb.writeByte(this.asset.multisignature.min);
    bb.writeByte(this.asset.multisignature.lifetime);
    for (let i = 0; i < keyGroupBuf.length; i++) {
      bb.writeByte(keyGroupBuf[i]);
    }
    bb.flip();
    return bb.toBuffer() as any;
  }


}