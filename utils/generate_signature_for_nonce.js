const rchainToolkit = require("rchain-toolkit");
const { blake2b } = require("blakejs");

/*
  This script will output the signature required by the names.rho contract to
  update a record on chain
*/

/*
  PRIVATE_KEY: string;
  Private key that corresponds to the public key of the record you wish to update
*/
const PRIVATE_KEY = "PRIVATE_KEY";
/*
  NONCE: string;
  Nonce of the record you wish to update
*/
const NONCE = "NONCE";

const bufferToSign = Buffer.from(NONCE, "utf8");
const uInt8Array = new Uint8Array(bufferToSign);

const blake2bHash = blake2b(uInt8Array, 0, 32);

const signature = rchainToolkit.utils.signSecp256k1(blake2bHash, PRIVATE_KEY);

const signatureHex = Buffer.from(signature).toString("hex");

console.log("SIGNATURE :", signatureHex);
