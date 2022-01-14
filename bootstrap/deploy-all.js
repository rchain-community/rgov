#!/usr/bin/env node

/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { join, resolve } = require('path');
const { readdir } = require('fs').promises;

const console = require('console');

const shell = require('./cli-utils/exec-script.js');
const { deploy } = require('./cli-utils/deploy-script');
const { easyDeploy } = require('./cli-utils/easy-deploy-script');
const { propose } = require('./cli-utils/propose-script');
const { stop_rnode } = require('./cli-utils/stop-rnode-script');
const { create_snapshot } = require('./cli-utils/create-snapshot-script');

const deployAll = async () => {
let directoryURI;

console.log('Cloning into rchain. This may take a while');

try {
await shell(`git clone https://github.com/rchain/rchain.git || (cd rchain && git pull)`)
} catch (err) {
    console.log('Failed')
}

const directory = join(__dirname, 'rchain');

console.log('getting all rchain core rholang files')

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
const ALLNETWORKS = require('./cli-utils/networks');
const network = 'localhost';
const privatekey_f = path.join(__dirname, 'PrivateKeys/pk.bootstrap');

const { run_rnode } = require('./cli-utils/run-rnode-script');

console.log('starting rnode');

await run_rnode(
    ALLNETWORKS,
    network,
    path.join(__dirname, 'PrivateKeys', 'pk.bootstrap'),
    path.join(__dirname, 'log', 'deploy-all.log'),
  );

console.log('deploying rchain core rholang files')

forAwait(getFiles(directory), (x) => {
  if (x.endsWith('.rho') && !x.includes('test') && !x.includes('examples')) {
    deploy(console, ALLNETWORKS, x, privatekey_f, network);
  }
});

await propose();

await create_snapshot('rchain-core');

await run_rnode(
  ALLNETWORKS,
  network,
  path.join(__dirname, 'PrivateKeys', 'pk.bootstrap'),
  path.join(__dirname, 'log', 'run-rnode.log'),
);

// easyDeploy(console, ALLNETWORKS, '../rholang/core/Directory.rho', privatekey_f, network);

// propose();

// // TODO: get Directory URI from output


// deploy_master_directory(directory_uri);

// propose();

// // TODO: get master URI from output or from log

// const masterURI = {
//   "localhostNETWORK": { "MasterURI": MasterURI }
// }

// async function getMasterURI () {
//     directoryURI = await easyDeploy(console, ALLNETWORKS, '../rholang/core/Directory.rho', privatekey_f, network);

//     await propose();

//     console.log(directoryURI);
// }

// getMasterURI;

// fs.writeFileSync(path.join(__dirname, "../src/MasterURI.localhost.json"), JSON.stringify(masterURI));

// create_snapshot("bare-master-dictionary");

// TODO: Deploy rgov standard contract
// TODO: Propose
// TODO: Create snapshot



//run-rnode
//restore-snapshot
}
deployAll();