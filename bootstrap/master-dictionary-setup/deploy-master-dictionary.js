/* eslint-disable */
const fs = require('fs');
const path = require('path');

const console = require('console');

const { easyDeploy } = require('../cli-utils/easy-deploy-script');
const { deploy_master_dictionary } = require('../cli-utils/master-dictionary-script');

const ALLNETWORKS = require('../cli-utils/networks-script');
const network = 'localhost';
const privatekey_f = path.join(__dirname, '../PrivateKeys/pk.bootstrap');

const deployMasterDictionary = async () => {
    // get directory URI from output
    const directoryURI = await easyDeploy(console, ALLNETWORKS, '../rholang/core/Directory.rho', privatekey_f, network);

    // deploy master dictionary
    masterReadURI = await deploy_master_dictionary(directoryURI);

    // create src directory if it does not exist
    const dir = path.join(__dirname, '../src');

   if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true});
    }


    fs.writeFileSync(path.join(__dirname, "../src/MasterURI.localhost.json"), JSON.stringify(masterReadURI));
}
deployMasterDictionary();