#!/usr/bin/env node

/* eslint-disable */
const fs = require('fs');
const path = require('path');

const { easyDeploy } = require('./cli-utils/easy-deploy-script');

const ALLNETWORKS = require('./cli-utils/networks');
const console = require('console');

let privatekey_f;
let network;

if (privatekey_f == undefined) {
    privatekey_f = path.join(__dirname, 'PrivateKeys/pk.bootstrap');
    console.log(`Private Key undefined, defaulting to ${privatekey_f}`);
  }
  if(network == undefined) {
    network = 'localhost';
    console.log(`Network undefined, defaulting to ${network}`);
  }

let rholang_f = process.argv.slice(2);

for (let i = 0; i < rholang_f.length; i += 1) {
    easyDeploy(console, ALLNETWORKS, rholang_f[i], privatekey_f, network);
  }