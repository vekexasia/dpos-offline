import { LiskWallet } from './liskWallet';

export class RiseWallet extends LiskWallet {
  constructor(secret: string) {
    super(secret, 'R');
  }
}
