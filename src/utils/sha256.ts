import * as crypto from 'crypto';

export const toSha256 = (what: Buffer) => crypto
  .createHash('sha256')
  .update(what)
  .digest();
