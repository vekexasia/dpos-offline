import { BaseTx } from './BaseTx';

export interface VoteAsset {
  /**
   * string array in the following format:
   *  ['-publicKey1', '+publicKey2']
   *  to remove publicKey1 and add publicKey2 among voted delegates
   */
  votes: string[]
}

/**
 * Vote transactions
 */
export class VoteTx extends BaseTx<VoteAsset> {
  type: number = 3;
  amount = 0;

  constructor(asset?:VoteAsset) {
    super(asset)
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean) {
    return this.asset && this.asset.votes ? Buffer.from(this.asset.votes.join(''), 'utf8'): null;
  }


}