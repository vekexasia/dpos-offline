let toExport;
// tslint:disable no-var-requires
try {
  toExport = require('sodium');
  if (typeof(toExport) === 'undefined' || typeof(toExport.api) === 'undefined') {
    throw new Error('switch to JS implementation');
  }
} catch (err) {
  // Sodium does not exist.
  toExport = require('../browser/sodium');
}
export const api = toExport.api;
