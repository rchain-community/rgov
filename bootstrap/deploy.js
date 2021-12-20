#!/usr/local/bin/node

const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const ALLNETWORKS = require('./networks');
const console = require('console');
const network_argument = 'localhost';

const rl = readline.createInterface({ input, output });

let privateKeyDir;
let privateKeyFile;
let privateKey;

// joining path of directory
const directoryPath = path.join(__dirname, 'PrivateKeys');
// passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
  // handling error
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  privateKeyDir = files;
});

// Get user input and use that to select a pk file
rl.question(
  `Select private key. Type 1 for alpha, 2 for bravo, 3 for charlie NB: bootstrap private key is used if no argument is given`,
  (answer) => {
    switch (answer) {
      case '1':
        privateKeyFile = privateKeyDir[0];
        break;
      case '2':
        privateKeyFile = privateKeyDir[2];
        break;
      case '3':
        privateKeyFile = privateKeyDir[3];
        break;
      default:
        privateKeyFile = privateKeyDir[1];
    }
    rl.close();

    console.log(privateKeyFile);

    try {
      privateKey = fs.readFileSync(`./PrivateKeys/${privateKeyFile}`, 'utf8');
    } catch (err) {
      console.error(err);
    }

    const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(privateKey);
    
    const rholang_files = process.argv.slice(2);

    // run deploy function with rholang file argument
    const deploy = async (rholang_f) => {
      const rholang = fs.readFileSync(rholang_f, 'utf8');
      const validAfterBlockNumber = await rchainToolkit.http.validAfterBlockNumber(
        ALLNETWORKS[network_argument].observerBase,
      );

      const deployOptions = rchainToolkit.utils.getDeployOptions(
        'secp256k1',
        new Date().valueOf(),
        rholang,
        privateKey,
        publicKey,
        1,
        100000,
        validAfterBlockNumber,
      );

      let deployResponse;
      try {
        deployResponse = await rchainToolkit.http.deploy(
          ALLNETWORKS[network_argument].observerBase,
          deployOptions,
        );
      } catch (err) {
        console.log(err);
      }

      console.log(deployResponse);
    };

    for (let i = 0; i < rholang_files.length; i += 1) {
      deploy(rholang_files[i]);
    }
  },
);
