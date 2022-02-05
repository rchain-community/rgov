#!/usr/bin/env node

/* eslint-disable */
const path = require('path');

const { check_rnode } = require('./cli-utils/check-rnode-script');
const ALLNETWORKS = require('./cli-utils/networks-script');
const { run_rnode } = require('./cli-utils/run-rnode-script');
const network = 'localhost';

run_rnode(
   ALLNETWORKS,
   network,
   path.join(__dirname, 'PrivateKeys', 'pk.bootstrap'),
   path.join(__dirname, 'log', 'run-rnode.log'),
);
