#!/usr/bin/env node

/* eslint-disable */
const path = require('path');
const { check_rnode } = require('./cli-utils/check-rnode_script');

const { run_rnode } = require('./cli-utils/run-rnode_script');

run_rnode(
   ALLNETWORKS,
   network,
   path.join(__dirname, 'PrivateKeys', 'pk.bootstrap'),
   path.join(__dirname, 'log', 'run-rnode.log'),
);
