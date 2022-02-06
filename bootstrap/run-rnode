#!/usr/bin/env node

/* eslint-disable */
const path = require('path');

const { checkRnode } = require('./cli-utils/check-rnode-script');
const ALLNETWORKS = require('./cli-utils/networks-script');
const { runRnode } = require('./cli-utils/run-rnode-script');
const network = 'localhost';

runRnode(
   ALLNETWORKS,
   network,
   path.join(__dirname, 'PrivateKeys', 'pk.bootstrap'),
   path.join(__dirname, 'log', 'run-rnode.log'),
);
