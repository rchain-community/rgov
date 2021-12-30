#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { join, resolve } = require('path');
const { readdir } = require('fs').promises;

const console = require('console');

const shell = require('./cli-utils/exec_shell.js');
const { deploy } = require('./cli-utils/deploy_script');

console.log('Cloning into rchain. This may take a while');

try {
shell(`git clone https://github.com/rchain/rchain.git || (cd rchain && git pull)`)
} catch (err) {
    console.log('Failed')
}

const directory = join(__dirname, 'rchain');

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}
function forAwait(asyncIter, f) {
  asyncIter.next().then(({ done, value }) => {
    if (done) return;
    f(value);
    forAwait(asyncIter, f);
  });
}
const ALLNETWORKS = require('./networks');
const network = 'localhost';
const privatekey_f = path.join(__dirname, 'PrivateKeys/pk.bootstrap');


forAwait(getFiles(directory), (x) => {
  if (x.endsWith('.rho') && !x.includes('test') && !x.includes('examples')) {
    deploy(console, ALLNETWORKS, x, privatekey_f, network);
  }
});

// TODO: Get propose working!!!!

// TODO: propose
// TODO: Create snapshot of rchain core
// TODO: Deploys dictionary.rho
// TODO: Propose
// TODO: Create master dictionary
// TODO: Write Mater URI to MasterURI.localhost.json
// TODO: Deploy rgov standard contract
// TODO: Propose
// TODO: Create snapshot

//run-rnode
//restore-snapshot
