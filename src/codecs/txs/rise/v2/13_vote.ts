import { As } from 'type-tagger';
import * as varuint from 'varuint-bitcoin';
import { BaseRiseV2Codec, RiseV2Transaction } from './base_v2';
import { IVoteTx } from '../../lisk';
import { Overwrite } from 'utility-types';

// tslint:disable-next-line
export type RiseV2VoteAsset = {
  added: string[],
  removed: string[]
};

function encodeVote(username: string): Buffer {
  const usernameBuf = Buffer.from(username, 'utf8');
  return Buffer.concat([varuint.encode(usernameBuf.length), usernameBuf]);
}

export type IVoteRiseV2Tx = Overwrite<IVoteTx, { identifier: 'vote-v2'}>;

export class RiseVoteV2TxCodec extends BaseRiseV2Codec<RiseV2VoteAsset> {

  constructor() {
    super(13, 'vote-v2');
  }

  public transform(from: IVoteTx<string>): RiseV2Transaction<RiseV2VoteAsset> {
    const added: string[]   = from.preferences
      .filter((a) => a.action === '+')
      .map((a) => a.delegateIdentifier);
    const removed: string[] = from.preferences
      .filter((a) => a.action === '-')
      .map((a) => a.delegateIdentifier);

    return {
      ... super.transform(from),
      asset: { added, removed },
    };
  }

  public calcFees(tx: IVoteTx): number {
    return 100000000;
  }

  protected assetBytes(tx: RiseV2Transaction<RiseV2VoteAsset>): Buffer {
    return  Buffer.concat([
      varuint.encode(tx.asset.added.length),
      ...tx.asset.added.map(encodeVote),
      varuint.encode(tx.asset.removed.length),
      ...tx.asset.removed.map(encodeVote),
    ]);
  }

  protected assetFromBytes(bytes: Buffer): RiseV2VoteAsset {
    let offset = 0;
    function decodeVotesArr() {
      const totalEntries = varuint.decode(bytes, offset);
      offset += varuint.decode.bytes;
      const toRet = [];
      for (let i = 0; i < totalEntries; i++) {
        const usernameLength = varuint.decode(bytes, offset);
        offset += varuint.decode.bytes;
        toRet.push(
          bytes.slice(offset, offset + usernameLength).toString('utf8')
        );
        offset += usernameLength;
      }
      return toRet;
    }
    const added = decodeVotesArr();
    const removed = decodeVotesArr();
    return { added, removed };
  }

}
