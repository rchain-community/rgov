/* eslint-disable */
const fs = require('fs');
const { join, resolve } = require('path');
const { readdir } = require('fs').promises;

const console = require('console');

const { easyDeploy } = require('../cli-utils/easy-deploy-script');
const { update_master_dictionary } = require('../cli-utils/master-dictionary-script');

const ALLNETWORKS = require('../cli-utils/networks-script');
const network = 'localhost';
const privatekey_f = join(__dirname, '../PrivateKeys/pk.bootstrap');

const deployRgovContract = async () => {
    let directoryURI;
    let result;

    const directory = join(__dirname, '../../rholang');
    console.log('this is the directory', directory);
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

     // deploy rgov contracts
     console.log('deploying rgov rholang files')

     forAwait(getFiles(directory), (x) => {
         async function deployContract() {
         if (x.endsWith('.rho')) {
             directoryURI = await easyDeploy(console, ALLNETWORKS, x, privatekey_f, network);
         }
         result = await update_master_dictionary(directoryURI[1], directoryURI[2]);
         console.log('this is the', result);
        }
        deployContract();
     });
}
deployRgovContract();