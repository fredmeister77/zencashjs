// @flow
var prf = require('./prf')
var address = require('./address')
var bs58check = require('bs58check')
var sodium = require('libsodium-wrappers-sumo')
var zconfig = require('./config')

/*
 * Creates a Z secret key (a_sk)
 * @param {String} phrase (Password phrase)
 * @return {Sting} Z secret key (a_sk)
 */
function mkZSecretKey (phrase: string): string {
  const a_sk: string = address.mkPrivKey(phrase)
  var baddr: Buffer = Buffer.from(a_sk, 'hex')
  baddr[0] &= 0x0f
  return baddr.toString('hex')
}

/*
 * Converts the secret key to a spending key
 * @param {String} a_sk (secret key)
 * @return {Sting} sk (spending key)
 */
function zSecretKeyToSpendingKey (a_sk: string): string {
  const buf = Buffer.from(zconfig.zcSpendingKeyHash + a_sk, 'hex')
  return bs58check.encode(buf).toString('hex')
}

/*
 * Converts a Z secret key to a paying key
 * @param {String} a_sk (secret key)
 * @return {Sting} a_pk key (paying key)
 */
function zSecretKeyToPayingKey (a_sk: string): string {
  return prf.PRF_addr_a_pk(Buffer.from(a_sk, 'hex')).toString('hex')
}

/*
 * Converts a Z secret key to a transmission key
 * @param {String} a_sk (secret key)
 * @return {Sting} pk_enc key (transmisison key)
 */
function zSecretKeyToTransmissionKey (a_sk: string): string {
  var sk_enc = prf.PRF_addr_sk_enc(Buffer.from(a_sk, 'hex'))

  // Curve 25519 clamping
  sk_enc[0] &= 248
  sk_enc[32] &= 127
  sk_enc[31] |= 64

  return Buffer.from(sodium.crypto_scalarmult_base(sk_enc)).toString('hex')
}

/*
 * Makes a Z address given:
 * @param {String} a_pk (paying key)
 * @param {String} pk_enc key (transmission key)
 * @return {String} Zaddress
 */
function mkZAddress (a_pk: string, pk_enc: string): string {
  const buf = Buffer.from(zconfig.zcPaymentAddressHash + a_pk + pk_enc, 'hex')
  return bs58check.encode(buf).toString('hex')
}

module.exports = {
  mkZSecretKey: mkZSecretKey,
  zSecretKeyToTransmissionKey: zSecretKeyToTransmissionKey,
  zSecretKeyToPayingKey: zSecretKeyToPayingKey,
  zSecretKeyToSpendingKey: zSecretKeyToSpendingKey,
  mkZAddress: mkZAddress
}
