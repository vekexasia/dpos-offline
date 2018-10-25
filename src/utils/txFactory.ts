import { CreateSignatureTx, DelegateTx, MultiSignatureTx, SendTx, VoteTx } from '../trxTypes';
import { BaseTx, ITransaction } from '../trxTypes/';

export const createTransactionFromOBJ = <K>(tx: ITransaction<any>): BaseTx<K> => {
  let txObj: BaseTx;
  if (tx.type === 0 /*Send*/) {
    txObj = new SendTx(tx.asset);
  } else if (tx.type === 1 /* Create second signature */) {
    txObj = new CreateSignatureTx(tx.asset);
  } else if (tx.type === 2 /* Register Delegate */) {
    txObj = new DelegateTx(tx.asset);
  } else if (tx.type === 3 /* Vote */) {
    txObj = new VoteTx(tx.asset);
  } else if (tx.type === 4 /* Create Multisig account */) {
    txObj = new MultiSignatureTx(tx.asset);
  }
  if (typeof(txObj) === 'undefined') {
    throw new Error(`Transaction ${tx.type} is not supported`);
  }
  Object.keys(tx)
    .filter((k) => typeof(tx[k]) !== 'undefined')
    .forEach((k) => txObj[k] = tx[k]);

  return txObj as BaseTx<K>;
};
