import { ITransaction } from '../trxTypes';

type Diff<T, U> = T extends U ? never : T;  // Remove types from T that are assignable to U

export type LiskITransaction<T> =
  Record<Diff<keyof ITransaction<T>, 'amount' | 'fee' | 'senderId' | 'requesterPublicKey'>, ITransaction<T>> & {
  amount: string,
  fee: string
};

export function liskifyTx<T = any>(tx: ITransaction<T>): LiskITransaction<T> {
  const toRet = {
    ...tx,
    amount: `${tx.amount}`,
    fee   : `${tx.fee}`,
  } as any;
  delete toRet.senderId;
  delete toRet.requesterPublicKey;
  return toRet;
}
