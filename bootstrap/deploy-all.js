#!/usr/bin/env node

/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { join, resolve } = require('path');
const { readdir } = require('fs').promises;
const http = require("http");

const console = require('console');

const shell = require('./cli-utils/exec-script.js');
const { deploy } = require('./cli-utils/deploy-script');
const { easyDeploy } = require('./cli-utils/easy-deploy-script');
const { propose } = require('./cli-utils/propose-script');
const { stop_rnode } = require('./cli-utils/stop-rnode-script');
const { create_snapshot } = require('./cli-utils/create-snapshot-script');
const { check_port } = require('./cli-utils/check-port-script');
const { run_rnode } = require('./cli-utils/run-rnode-script');

const deployAll = async () => {

const READ_ONLY_URL = 'http://127.0.0.1:40403'
const directory = join(__dirname, 'rchain');
const ALLNETWORKS = require('./cli-utils/networks');
const network = 'localhost';
const privatekey_f = path.join(__dirname, 'PrivateKeys/pk.bootstrap');

let deploy_response;
let propose_response;
 
// clone rchain files from github
try {
    if (!fs.existsSync(directory)) {
        console.log('Cloning into rchain. This may take a while');
        await shell(`git clone https://github.com/rchain/rchain.git`)
    } else {
        console.log('rchain already exists, updating....')
        await shell(`cd rchain && git pull`);
    }
} catch (err) {
            console.log('Failed')
            return;
}

console.log('getting all rchain core rholang files')

// get rholang files from rchain directory function
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

console.log('starting rnode');

// run rnode
await run_rnode(
    ALLNETWORKS,
    network,
    path.join(__dirname, 'PrivateKeys', 'pk.bootstrap'),
    path.join(__dirname, 'log', 'deploy-all.log'),
  )

// wait for http port to open and do deploy
const waitAndDeploy = setInterval(() => {
    
          const req = http.get(
            `${READ_ONLY_URL}/api/blocks/1`,
            {},
            (resp) => {
              if (resp.statusCode !== 200) {
                console.log(
                  'rnode observer blocks api not ready (1), will try again in 10s'
                );
                return;
              }
  
              resp.setEncoding('utf8');
              let rawData = '';
              resp.on('data', (chunk) => {
                rawData += chunk;
              });
              resp.on('end', () => {
                if (typeof JSON.parse(rawData)[0].blockHash === 'string') {
                  
                // deploy rchain core files
                  console.log('deploying rchain core rholang files')

                    forAwait(getFiles(directory), (x) => {
                        if (x.endsWith('.rho') && !x.includes('test') && !x.includes('examples')) {
                            deploy_response = deploy(console, ALLNETWORKS, x, privatekey_f, network);
                        }
                    });
                clearInterval(waitAndDeploy);
                  // RCHAIN READY
                }
              });
              resp.on('error', (err) => {
                throw new Error(err);
              });
            }
          );
  
          req.end();
          req.on('error', (err) => {
            console.log(err);
            console.log('rnode observer blocks api not ready (2), will try again in 10s');
          });
  }, 10000);

// wait for deploy response, do propose and create snapshot
  const waitAndPropose = setInterval(
   async () => {
      if (deploy_response) {
          console.log('propose in progress')
          propose_response = await propose();
          console.log('propose response:',propose_response.message);
        clearInterval(waitAndPropose);
          deploy_response = '';
          if (propose_response.message === 'result'){
            console.log('snapshot in progress')
            create_snapshot('rchain-core');
            console.log('next 01.....');
        }
      }
    },
    10000
  );

console.log('next 02......');

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