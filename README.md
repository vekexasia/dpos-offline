[![npm](https://img.shields.io/npm/v/dpos-offline.svg)](https://npmjs.org/package/dpos-offline) 

# Offline signing DPOS utils

This library can ease adoption on offline transaction signing for some Dpos coins. Works both server-side (using sodium c++ bindings) and client-side (using libsodium.js lib).

## Motivation

I've built this library cause there were no such library that had **all the following** :
  - uses c++ binding when in node environment leveraging native code execution speed
  - easy to use/understand
  - used proper class inheritance
  - had proper test units against both node and browsers

Furthermore the library is written in TypeScript which also provide code assist utilities to developers making it even easier to use.


## What does this library do?

### Wallet utilities
An example worths more than 100 words.
```typescript
const dposUtils = require('dpos-utils').dposUtils;
const account = new dposUtils.wallets.LiskWallet('my secret');
console.log(`priv Key: ${account.privKey}`);
console.log(`public Key: ${account.publicKey}`);
console.log(`address: ${account.address}`);
```

The library can derive `privKey`, `publicKey` & `address` from your secret (both in node and browser) without querying any server.

For other coins (other than Lisk) you could call LiskWallet with your own address suffix. example:

```typescript
const shiftAccount = new dposUtils.wallets.LiskWallet('my secret', 'S');
console.log(`address: ${shiftAccount.address}`); // address will end with an 'S'
```

### Transaction Utilities

The library really shines when using it for signing transactions but lets start from the beginning.

Creating a `Send` transaction is really easy and the library brings some syntactic sugar for all kind of developers out there. The following three snippets will produce the same result:

```typescript
const sendTx = new dposUtils.transactions.SendTx();
sendTx
  .withFees(1000000) // Satoshis
  .withAmount(20000000) // Satoshis
  .withTimestamp(1000)
  .withSenderPublicKey('senderPublicKey')
  .withRecipientId('123456L');
```
OR

```typescript
const sendTx = new dposUtils.transactions.SendTx();
sendTx.fee = 1000000;
sendTx.amount = 20000000;
sendTx.timestamp= 1000;
sendTx.senderPublicKey = 'senderPublicKey'
sendTx.recipientId = '123456L';
```

OR

```typescript
const sendTx = new dposUtils.transactions.SendTx();
sendTx
  .set('fee', 1000000)
  .set('amount', 2000000)
  .set('timestamp', 1000)
  .set('senderPublicKey', 'senderPublicKey')
  .set('recipientId', '123456L')
```

All of the above will set the data needed for the tx to be signed.

To sign a transaction just call the `.sign` method like so:

```typescript
const genTx = new SendTx()
  .set('fee', 1000000)
  .set('amount', 2000000)
  .set('timestamp', 1000)
  .set('senderPublicKey', 'senderPublicKey')
  .set('recipientId', '123456L')
  .sign(privateKey); // Private Key may come from wallet.
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

**The browser library is ~500KB can you reduce the size of it**? 
I already trimmed dead-code but most of the size is due to libsodium.js which takes ~350K. Keep in mind that, when gzipped, this library is about 140K.

**Is this library fast as "equivalent" core-code routines**? 
Yes. When used in node.js it uses `sodium` native bindings for node (just like core code).

**Should I use this in production**?
While it's tested, use it at your own risk!

## Donations

If you like my work and would like to support my work. You could consider to donate me something at the following addresses:

 - **LISK**: 9102643396261850794L
 - **SHIFT**: 16159457535471071047S
 - **RISE**: 9857707766596718725R
 
