/* eslint-disable */
const fs = require('fs');
const path = require('path');

const console = require('console');

const { easyDeploy } = require('../cli-utils/easy-deploy-script');
const { propose } = require('../cli-utils/propose-script');
const { deployMasterDictionary } = require('../cli-utils/master-dictionary-script');

const ALLNETWORKS = require('../cli-utils/networks-script');
const network = 'localhost';
const privatekey_f = path.join(__dirname, '../PrivateKeys/pk.bootstrap');

const createDirectoryContract = async () => {
  const directoryURI = easyDeploy(console, ALLNETWORKS, '../rholang/core/Directory.rho', privatekey_f, network);
  directoryURI.then(uri => createMasterDictionary(uri[2]));
  const response1 = await propose();
  console.log("response 1: " + response1);
  return directoryURI[2];
}

const createMasterDictionary = (URI) => {
    // deploy master dictionary
    console.log("using uri " + URI + "for master dictionary")
    masterReadURI = deployMasterDictionary(URI);
    const response2 = propose();
    console.log(masterReadURI)
    console.log("response 2:" + response2)

    // create src directory if it does not exist
   const dir = path.join(__dirname, '../src')
   if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true});
    }

    // write the master read uri to the MasterURI localhost file
    fs.writeFileSync(path.join(__dirname, "../src/MasterURI.localhost.json"), JSON.stringify(masterReadURI));
}

createDirectoryContract().then(uri => console.log(uri));
