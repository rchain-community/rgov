#!/usr/local/bin/node

/* eslint-disable */
const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const path = require('path');

const ALLNETWORKS = require('./cli-utils/networks-script');
const  {explore}  = require('./cli-utils/explore-script');

const argv = require('minimist')(process.argv.slice(2));
let privatekey_f = argv.pk;
let rholang_files = argv._;
let network = argv.network;
if (privatekey_f == undefined) {
  privatekey_f = path.join(__dirname, 'PrivateKeys/pk.bootstrap');
  console.log(`Private Key undefined, defaulting to ${privatekey_f}`);
}
if (network == undefined) {
  network = 'localhost';
  console.log(`Network undefined, defaulting to ${network}`);
}

for (let i = 0; i < rholang_files.length; i += 1) {
  const return_value = explore(console, ALLNETWORKS, rholang_files[i], privatekey_f, network);
  return_value.then(function(result) {
    console.log(result)
  })
}
