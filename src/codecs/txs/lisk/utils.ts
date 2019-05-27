import { BaseLiskCodec} from './base_lisk';
import { LiskSendTxCodec } from './0_send';
import { LiskSecondSignTxCodec } from './1_secondsignature';
import { LiskRegDelegateTxCodec } from './2_regdelegate';
import { LiskVoteTxCodec } from './3_vote';

export const liskCodecUtils = {
  allCodecs: [
    new LiskSendTxCodec(),
    new LiskVoteTxCodec(),
    new LiskRegDelegateTxCodec(),
    new LiskSecondSignTxCodec(),
  ],
  findCodecFromType<T = any>(type: number): BaseLiskCodec<T> {
    const [codec] = this.allCodecs
      .filter((c) => c.type === type);

    if (!codec) {
      throw new Error(`No codec found for type=${type}`);
    }
    return codec;
  },
  findCodecFromIdentifier<T = any>(identifier: string): BaseLiskCodec<T> {
    const [codec] = this.allCodecs
      .filter((c) => c.identifier === identifier);

    if (!codec) {
      throw new Error(`No codec found for identifier=${identifier}`);
    }
    return codec;
  },
};
