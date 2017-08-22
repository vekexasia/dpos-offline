import * as ByteBuffer from 'bytebuffer';
import * as empty from 'is-empty';
import { BaseTx } from './BaseTx';

/**
 * Defines a Dapp
 */
export interface IDapp {
  category: number;
  name: string;
  description: string;
  tags: string;
  type: number;
  link: string;
  icon: string;
}

export interface IDappAsset {
  dapp: IDapp;
}

/**
 * Dapp Transaction
 */
export class DappTx extends BaseTx<IDappAsset> {
  public type: number = 4;
  public amount       = 0;

  constructor(asset?: IDappAsset) {
    super(asset);
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean): Buffer {
    const buf = Buffer.from(this.asset.dapp.name, 'utf8');
    Buffer.concat(['name', 'description', 'tags', 'link', 'icon']
      .map((what) => this.asset.dapp[what])
      .filter((item) => !empty(item))
      .map((item) => Buffer.from(item, 'utf8')));

    const bb = new ByteBuffer(4 * 2, true);
    bb.writeInt(this.asset.dapp.type);
    bb.writeInt(this.asset.dapp.category);
    bb.flip();
    return Buffer.concat([buf, bb.toBuffer() as any]);
  }

}
