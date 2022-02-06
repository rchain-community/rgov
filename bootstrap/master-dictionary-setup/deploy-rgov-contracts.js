/* eslint-disable */
const { join, resolve } = require('path');
const { readdir } = require('fs').promises;

const console = require('console');

const { easyDeploy } = require('../cli-utils/easy-deploy-script');
const { generateRholangContract } = require('../cli-utils/master-dictionary-script');
const { propose } = require('../cli-utils/propose-script');

const ALLNETWORKS = require('../cli-utils/networks-script');
const network = 'localhost';
const privatekey_f = join(__dirname, '../PrivateKeys/pk.bootstrap');

const deployRgovContract = async () => {
    let directoryURI;
    let result;

    const directory = join(__dirname, '../../rholang');

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
     forAwait(getFiles(directory), (x) => {
         async function deployContract() {

        // exclude rgov contracts that should not be written into the master dictionary
         if (x.endsWith('.rho') && !x.includes('CrowdFund') && !x.includes('memberIdGovRev') && !x.includes('RevIssuer') && !x.includes('MemberDirectory')) {

             directoryURI = await easyDeploy(console, ALLNETWORKS, x, privatekey_f, network);

            await generateRholangContract(directoryURI[1], directoryURI[2]);

         }

        }
        deployContract();
     });
}
deployRgovContract().then(_ => propose().then(res => console.log(res)));
