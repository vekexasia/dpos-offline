import {BaseTx} from './BaseTx';
import * as ByteBuffer from "bytebuffer";

export interface CreateSignatureAssetType {
  signature: { publicKey: string }
}

/**
 * Transaction of type "Create second signature".
 */
export class CreateSignatureTx extends BaseTx<CreateSignatureAssetType> {
  type: number = 1;
  amount       = 0;

  constructor(asset?: CreateSignatureAssetType) {
    super(asset)
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer {
    const bb = new ByteBuffer(32, true);
    BaseTx.hexKeyInByteBuffer(this.asset.signature.publicKey, bb);
    bb.flip();
    return bb.toBuffer() as any;
  }


}