/* eslint-disable */

const fs = require('fs');
// TODO(#185): stop pretending MasterURI is a design-time constant.
// Meanwhile, see bootstrap/deploy-all for how MasterURI.localhost.json get created
// and to tsc and eslint, we say "please excuse me" as follows:
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
const getMasterURI = (network) => {
    const srcDir = "../src/";
    const masterURIBase = srcDir + "MasterURI.";
    const uriFile = masterURIBase + network + ".json";

    const jsonFile = fs.readFileSync(uriFile, 'utf8');
    const parseFile = JSON.parse(jsonFile);
    const MasterURI = parseFile[network + "NETWORK"].MasterURI;
    return MasterURI;
}

const NETWORKS = {
    localhost: {
      hostPattern: 'localhost',
      observerBase: 'http://localhost:40403',
      validatorBase: 'http://localhost:40403',
      adminBase: 'http://localhost:40405',
      MasterURI: getMasterURI('localhost'),
    },
    testnet: {
      hostPattern: 'test',
      observerBase: 'https://observer.testnet.rchain.coop',
      // TODO: rotate validators
      validatorBase: 'https://node0.testnet.rchain-dev.tk',
      adminBase: '',
      MasterURI: getMasterURI('testnet'),
    },
    demo: {
      hostPattern: 'demo',
      observerBase: 'https://demoapi.rhobot.net',
      // TODO: rotate validators
      validatorBase: 'https://demoapi.rhobot.net',
      adminBase: 'https://demoadmin.rhobot.net',
      MasterURI: getMasterURI('demo'),
    },
    rhobot: {
      hostPattern: 'rhobot',
      observerBase: 'https://rnodeapi.rhobot.net',
      // TODO: rotate validators
      validatorBase: 'https://rnodeapi.rhobot.net',
      adminBase: 'https://rnodeadmin.rhobot.net',
      MasterURI: getMasterURI('rhobot'),
    },
    mainnet: {
      hostPattern: 'main',
      observerBase: 'https://observer.services.mainnet.rchain.coop',
      validatorBase: 'https://node12.root-shard.mainnet.rchain.coop',
      adminBase: '',
      MasterURI: getMasterURI('mainnet'),
    },
};

module.exports = NETWORKS;
