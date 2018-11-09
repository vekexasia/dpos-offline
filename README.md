[![npm](https://img.shields.io/npm/v/dpos-offline.svg)](https://npmjs.org/package/dpos-offline) [![Build Status](https://travis-ci.org/vekexasia/dpos-offline.svg?branch=master)](https://travis-ci.org/vekexasia/dpos-offline) [![Coverage Status](https://coveralls.io/repos/github/vekexasia/dpos-offline/badge.svg?branch=master)](https://coveralls.io/github/vekexasia/dpos-offline?branch=master)

# Offline signing DPOS utils 2.0

This library can ease adoption on offline transaction signing for some Dpos coins. Works both server-side (using sodium c++ bindings) and client-side (using tweetnacl lib).

## Motivation

I've built this library cause there were no such library that had **all the following** :
  - uses c++ binding when in node environment leveraging native code execution speed
  - easy to use/understand
  - had proper tests for both node and browsers

Furthermore the library is written in TypeScript which also provide **code assist utilities** to developers making it even easier to use.

## Quick Start

Install using `npm i dpos-offline` and use it with webpack or node by requiring it in your code

```javascript
var dposOffline = require('dpos-offline').dposOffline
```

Or directly use it in your browser by including it:

```html
<script type="text/javascript" src="https://gitcdn.xyz/cdn/vekexasia/dpos-offline/master/dist/browser/index.js"></script>
<script type="text/javascript">
  // use dposOffline variable.
</script>
```

## What does this library do?

### Create a Send Transaction

An example worths more than 100 words.

```javascript
const Lisk = require('dpos-offline').Lisk;
const Rise = require('dpos-offline').Rise;
const tx = Lisk.txs.createAndSign(
  {
    kind: 'send',
    amount: 100000000, // Satoshi
    recipient: '1L'
  },
  'my Lisk secret'
);

// tx will now contain a postable (via API) transaction object

// It works the same for Rise (or the other supported coins)
const riseTx = Rise.txs.createAndSign(
  {
    kind: 'send',
    amount: 100000000, // Satoshi
    recipient: '1R'
  },
  'my RISE secret'
)

```

### Create a Vote Transaction

```javascript
const voteTx = Rise.txs.createAndSign(
  {
    kind: 'vote',
    preferences: [
      {
        delegateIdentifier: Buffer.from('pubKey of delegate to vote'),
        action: '+'
      },
      {
        delegateIdentifier: Buffer.from('pubKey of delegate to unvote'),
        action: '-'
      }
    ]
  },
  'my RISE secret'
);
```

### Second signing existing signed transaction

```javascript
// const signedTx;
signedTx.signSignature = Rise.txs.calcSignature(signedTx, 'second secret');

// Will recalc id and transform the transaction to a postable format via API.
const transformedTx = Rise.txs.toPostable(signedTx);

```


### Registering a delegate

```javascript
const tx = Rise.txs.createAndSign({
  kind: 'register-delegate',
  identifier: 'vekexasia'
});
```

### Other transaction types.

The following transaction types are supported using the `.createAndSign` method:
 
 * send
 * vote
 * register delegate
 * add second signature (Lisk and all Lisk derived coins)
 * create multisignature (Lisk and all Lisk derived coins)
 
### Raw transaction creation

Sometimes you want to decide `fee` and `timestamp` (also referenced as `nonce` within the library). The `.createAndSign` method allows to specify both `fee` and `nonce`.

If you want to create your own object you can use the `.fromPostable` method that converts a tx in postable-via-api format to an inner tx format that could be used with the majority of methods provided.


### Verify transaction signature

the `.txs.verify` method allows checking the provided signature object is valid (against the given pubKey).


## Message Signing and Verify

Signing and verifying a message is critical for some applications. The `.msgs` package will provide the methods:

 * sign(msg: Buffer | string, kp: IKeypair) => Buffer & As<'signature'>
 * verify(msg: Buffer | string, signature: Buffer & As<'signature'>, publicKey: Buffer & As<'publicKey'>) => boolean

That could be used to sign and verify messages using the format used for such coin. 

---

## FAQs 

**Where can I find the documentation?**

[here](https://github.com/vekexasia/dpos-offline/blob/master/src/codecs/interface.ts)

**Is this library secure**?

Well offline signing is considered a best practice in terms of security


**Is this library tested**? 

The library is baked by over 1000 single tests. Most of them are equality checks between this library and original code.


**Does this library work on any browser**?

Should work on any modern browser. Feel free to report a bug if not.


**What are the tested browsers**?

Chrome and Firefox through `karma` library 


**Can I add support to another coin**?

Yes the library is created with extendibility in mind. Adding a new (even very different) coin support should be really easy by extending and overriding the code.


**The browser library is ~120KB can you reduce the size of it**?

Keep in mind that, when gzipped, this library is about 40K.


**Is this library fast as "equivalent" core-code routines**?

Yes. When used in node.js it uses `sodium-native` native bindings for node (just like core code). Yeah it's fast.


**Should I use this in production**?

While it's tested, use it at your own risk!


## Donations

If you like my work and would like to support my work. You could consider to donate me something at the following addresses:

 - **LISK**: 9102643396261850794L
 - **SHIFT**: 16159457535471071047S
 - **RISE**: 9857707766596718725R
 
