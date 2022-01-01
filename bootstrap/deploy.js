#!/usr/bin/env node

/* eslint-disable */
const fs = require('fs');
const path = require('path');

const { deploy } = require('./cli-utils/deploy_script');

const ALLNETWORKS = require('./cli-utils/networks');
const console = require('console');

const argv = require('minimist')(process.argv.slice(2));
let privatekey_f = argv.pk;
let rholang_files = argv._;
let network = argv.network;
if (privatekey_f == undefined) {
  privatekey_f = path.join(__dirname, 'PrivateKeys/pk.bootstrap');
  console.log(`Private Key undefined, defaulting to ${privatekey_f}`);
}
if(network == undefined) {
  network = 'localhost';
  console.log(`Network undefined, defaulting to ${network}`);
}

for (let i = 0; i < rholang_files.length; i += 1) {
  deploy(console, ALLNETWORKS, rholang_files[i], privatekey_f, network);
}
