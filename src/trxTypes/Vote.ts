import { BaseTx } from './BaseTx';

export interface IVoteAsset {
  /**
   * string array in the following format:
   *  ['-publicKey1', '+publicKey2']
   *  to remove publicKey1 and add publicKey2 among voted delegates
   */
  votes: string[];
}

/**
 * Vote transactions
 */
export class VoteTx extends BaseTx<IVoteAsset> {
  public type: number = 3;
  public amount       = 0;

  constructor(asset?: IVoteAsset) {
    super(asset);
  }

  protected getChildBytes(skipSignature: boolean, skipSecondSign: boolean) {
    return this.asset && this.asset.votes ? Buffer.from(this.asset.votes.join(''), 'utf8') : null;
  }
}
