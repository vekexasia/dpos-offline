console.log('ano');
import {
  BaseRiseV2Codec,
  RiseRegDelegateV2TxCodec,
  RiseSecondSignV2TxCodec,
  RiseSendV2TxCodec,
  RiseVoteV2TxCodec
} from './v2';
console.log('ano');
import { BaseLiskCodec } from '../lisk';
console.log('ano');
import { RiseRegDelegateV1TxCodec, RiseSecondSignV1TxCodec, RiseSendV1TxCodec, RiseVoteV1TxCodec } from './v1';

export const riseCodecUtils = {
  allCodecs: [
    new RiseSendV1TxCodec(),
    new RiseSendV2TxCodec(),

    new RiseVoteV1TxCodec(),
    new RiseVoteV2TxCodec(),

    new RiseRegDelegateV1TxCodec(),
    new RiseRegDelegateV2TxCodec(),

    new RiseSecondSignV1TxCodec(),
    new RiseSecondSignV2TxCodec(),

  ],
  findCodecFromType<T = any>(type: number): BaseRiseV2Codec<T> | BaseLiskCodec<T> {
    const [codec] = this.allCodecs
      .filter((c) => c.type === type);

    if (!codec) {
      throw new Error(`No codec found for type=${type}`);
    }
    return codec;
  },
  findCodecFromIdentifier<T = any>(identifier: string): BaseRiseV2Codec<T> | BaseLiskCodec<T> {
    const [codec] = this.allCodecs
      .filter((c) => c.identifier === identifier);

    if (!codec) {
      throw new Error(`No codec found for identifier=${identifier}`);
    }
    return codec;
  },
};
