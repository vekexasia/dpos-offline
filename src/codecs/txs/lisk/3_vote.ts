import { As } from 'type-tagger';
import { IBaseTx } from '../base';
import { BaseLiskCodec, LiskTransaction } from './base_lisk';

/**
 * Voting Item for the Vote Transaction interface
 */
export interface IVoteItem<IDentifier> {
  /**
   * The identifier of the delegate to vote/unvoite
   */
  delegateIdentifier: IDentifier;
  /**
   * An optional vote weight to assign to the delegate. (If the coin supports it)
   */
  weight?: string;
  /**
   * The action to perform + => vote, - => unvote
   */
  action: '-' | '+';
}

/**
 * Vote transaction identifier
 */
export interface IVoteTx<IDentifier = Buffer & As<'publicKey'>> extends IBaseTx {
  readonly kind: 'vote';
  /**
   * Preference array of the votes to perform
   */
  readonly preferences: Array<IVoteItem<IDentifier>>;
}

// tslint:disable-next-line
export type LiskVotesAsset = { votes?: string[] };

export class LiskVoteTxCodec extends BaseLiskCodec<LiskVotesAsset> {

  constructor() {
    super(3, 'vote');
  }

  public calcFees(tx: IVoteTx): number {
    return 100000000;
  }

  public transform(from: IVoteTx): LiskTransaction<LiskVotesAsset> {
    const s = super.transform(from);
    const votes: string[] = [];
    for (const pref of from.preferences) {
      votes.push(`${pref.action}${pref.delegateIdentifier.toString('hex')}`);
    }
    s.asset = { votes };
    return s;
  }

  protected assetBytes(tx: LiskTransaction<LiskVotesAsset>): Buffer {
    return Buffer.from(tx.asset.votes.join(''), 'utf8');
  }

}
