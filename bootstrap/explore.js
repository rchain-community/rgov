#!/usr/bin/env node
/* eslint-disable prettier/prettier */

const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const path = require('path');

const ALLNETWORKS = require('./networks');
const { explore } = require('./cli-utils/explore_script');

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
