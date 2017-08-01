import * as ByteBuffer from 'bytebuffer';
import {BaseTx} from './BaseTx';

export interface ICreateSignatureAssetType {
  signature: { publicKey: string };
}

/**
 * Transaction of type "Create second signature".
 */
export class CreateSignatureTx extends BaseTx<ICreateSignatureAssetType> {
  public type: number = 1;
  public amount       = 0;

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer {
    const bb = new ByteBuffer(32, true);
    BaseTx.hexKeyInByteBuffer(this.asset.signature.publicKey, bb);
    bb.flip();
    return bb.toBuffer() as any;
  }

}
