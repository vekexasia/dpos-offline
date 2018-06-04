[![npm](https://img.shields.io/npm/v/dpos-offline.svg)](https://npmjs.org/package/dpos-offline) [![Build Status](https://travis-ci.org/vekexasia/dpos-offline.svg?branch=master)](https://travis-ci.org/vekexasia/dpos-offline) [![Coverage Status](https://coveralls.io/repos/github/vekexasia/dpos-offline/badge.svg?branch=master)](https://coveralls.io/github/vekexasia/dpos-offline?branch=master)

# Offline signing DPOS utils

This library can ease adoption on offline transaction signing for some Dpos coins. Works both server-side (using sodium c++ bindings) and client-side (using libsodium.js lib).

## Motivation

I've built this library cause there were no such library that had **all the following** :
  - uses c++ binding when in node environment leveraging native code execution speed
  - easy to use/understand
  - used proper class inheritance
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

### Wallet utilities
An example worths more than 100 words.
```javascript
const dposOffline = require('dpos-offline').dposOffline;
const account = new dposOffline.wallets.LiskLikeWallet('my secret');
console.log(`priv Key: ${account.privKey}`);
console.log(`public Key: ${account.publicKey}`);
console.log(`address: ${account.address}`);
```
You could also import LiskWallet directly via object destructuring

```javascript
import { LiskWallet } from 'dpos-offline'
```

**Note**: when importing from destructuring the name is `LiskWallet` but when using the `wallets` namespace the name is `LiskLikeWallet`


The library can derive `privKey`, `publicKey` & `address` from your secret (both in node and browser) without querying any server.

For other coins (other than Lisk) you could call LiskWallet with your own address suffix. example:

```typescript
const shiftAccount = new dposOffline.wallets.LiskLikeWallet('my secret', 'S');
console.log(`address: ${shiftAccount.address}`); // address will end with an 'S'
```

### Transaction Utilities

The library really shines when using it for signing transactions but lets start from the beginning.

Creating a `Send` transaction is really easy and the library brings some syntactic sugar for all kind of developers out there. The following three snippets will produce the same result:

```javascript
const sendTx = new dposOffline.transactions.SendTx();
sendTx
  .withFees(1000000) // Satoshis
  .withAmount(20000000) // Satoshis
  .withTimestamp(1000)
  .withSenderPublicKey('senderPublicKey')
  .withRecipientId('123456L');
```
OR

```javascript
const sendTx = new dposOffline.transactions.SendTx();
sendTx.fee = 1000000;
sendTx.amount = 20000000;
sendTx.timestamp= 1000;
sendTx.senderPublicKey = 'senderPublicKey'
sendTx.recipientId = '123456L';
```

OR

```javascript
const sendTx = new dposOffline.transactions.SendTx();
sendTx
  .set('fee', 1000000)
  .set('amount', 2000000)
  .set('timestamp', 1000)
  .set('senderPublicKey', 'senderPublicKey')
  .set('recipientId', '123456L')
```

All of the above will set the data needed for the tx to be signed.

To sign a transaction just call the `.sign` method. You can either use raw Private key or pass a wallet instance to the method.

For second signature accounts an optional second parameter is accepted. 

```javascript
const wallet = new LiskLikeWallet('my secret');
const genTx = new SendTx()
  .set('fee', 1000000)
  .set('amount', 2000000)
  .set('timestamp', 1000)
  .set('senderPublicKey', 'senderPublicKey')
  .set('recipientId', '123456L')
  .sign(wallet /*, optionalsecondSignaturePrivKey */); 
  // .sign(rawPrivateKey); 
```


---

## FAQs 

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


**The browser library is ~140KB can you reduce the size of it**?

Keep in mind that, when gzipped, this library is about 40K.


**Is this library fast as "equivalent" core-code routines**?

Yes. When used in node.js it uses `sodium` native bindings for node (just like core code).


**Should I use this in production**?

While it's tested, use it at your own risk!


## Donations

If you like my work and would like to support my work. You could consider to donate me something at the following addresses:

 - **LISK**: 9102643396261850794L
 - **SHIFT**: 16159457535471071047S
 - **RISE**: 9857707766596718725R
 
