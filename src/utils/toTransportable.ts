
/**
 * Transforms an object with some Buffers to strings.
 * @param obj
 * @param maxRecursionLevel
 */
export const toTransportable = (obj: any, maxRecursionLevel: number = 5) => {
  if (maxRecursionLevel < 0) {
    throw new Error('Object cannot be transformed to transport format');
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => toTransportable(item, maxRecursionLevel - 1));
  }
  if (Buffer.isBuffer(obj)) {
    return obj.toString('hex');
  }
  if (typeof obj === 'function') {
    return undefined;
  }
  if (typeof obj !== 'object' || obj === null || typeof obj === 'undefined') {
    return obj;
  }
  const toRet = {...obj};
  const keys = Object.keys(obj);
  for (const key of keys) {
    toRet[key] = toTransportable(toRet[key], maxRecursionLevel - 1);
    if (typeof toRet[key] === 'undefined') {
      delete toRet[key];
    }
  }
  return toRet;
};
