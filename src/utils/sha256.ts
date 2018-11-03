import * as crypto from 'crypto';

export const toSha256 = (what: string | Buffer) => crypto
  .createHash('sha256')
  .update(Buffer.isBuffer(what) ? what : Buffer.from(what, 'utf8'))
  .digest();
