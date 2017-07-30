// NODE version uses crypto module
import * as sha256 from 'sha.js/sha256.js';
export const toSha256 = (what: string|Buffer) => new sha256().update(what).digest();