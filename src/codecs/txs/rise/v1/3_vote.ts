import { IVoteTx, LiskVotesAsset } from '../../lisk';
import { RiseV2Transaction } from '../base_rise';
import { BaseRiseV1Codec } from './base_v1';

export class RiseVoteV1TxCodec extends BaseRiseV1Codec<LiskVotesAsset> {

  constructor() {
    super(3, 'vote');
  }

  public calcFees(tx: IVoteTx): number {
    return 100000000;
  }

  public transform(from: IVoteTx): RiseV2Transaction<LiskVotesAsset> {
    const s = super.transform(from);
    const votes: string[] = [];
    for (const pref of from.preferences) {
      votes.push(`${pref.action}${pref.delegateIdentifier.toString('hex')}`);
    }
    s.recipientId = s.senderId;
    s.asset = { votes };
    return s;
  }

  protected assetBytes(tx: RiseV2Transaction<LiskVotesAsset>): Buffer {
    return Buffer.from(tx.asset.votes.join(''), 'utf8');
  }

}
