/* eslint-disable prettier/prettier */

const fs = require('fs');
// TODO(#185): stop pretending MasterURI is a design-time constant.
// Meanwhile, see bootstrap/deploy-all for MasterURI.localhost.json
// and to tsc and eslint, we say "please excuse me" as follows:
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
const getMasterURI = (path, network) => {
    const jsonFile = fs.readFileSync(path, 'utf8');
    const parseFile = JSON.parse(jsonFile);
    const MasterURI = parseFile[network].MasterURI;
    return MasterURI;
}

const NETWORKS = {
    localhost: {
      hostPattern: 'localhost',
      observerBase: 'http://localhost:40403',
      validatorBase: 'http://localhost:40403',
      adminBase: 'http://localhost:40405',
    MasterURI: getMasterURI(
      '../src/MasterURI.localhost.json',
      'localhostNETWORK'),
    },
    testnet: {
      hostPattern: 'test',
      observerBase: 'https://observer.testnet.rchain.coop',
      // TODO: rotate validators
      validatorBase: 'https://node0.testnet.rchain-dev.tk',
      adminBase: '',
      MasterURI: getMasterURI('../src/MasterURI.testnet.json', 'testnetNETWORK'),
    },
    demo: {
      hostPattern: 'demo',
      observerBase: 'https://demoapi.rhobot.net',
      // TODO: rotate validators
      validatorBase: 'https://demoapi.rhobot.net',
      adminBase: 'https://demoadmin.rhobot.net',
      MasterURI: getMasterURI('../src/MasterURI.demo.json', 'demoNETWORK'),
    },
    rhobot: {
      hostPattern: 'rhobot',
      observerBase: 'https://rnodeapi.rhobot.net',
      // TODO: rotate validators
      validatorBase: 'https://rnodeapi.rhobot.net',
      adminBase: 'https://rnodeadmin.rhobot.net',
      MasterURI: getMasterURI('../src/MasterURI.rhobot.json', 'rhobotNETWORK'),
    },
    mainnet: {
      observerBase: 'https://observer.services.mainnet.rchain.coop',
      validatorBase: 'https://node12.root-shard.mainnet.rchain.coop',
      adminBase: '',
      MasterURI: getMasterURI('../src/MasterURI.mainnet.json', 'mainnetNETWORK'),
    },
};

module.exports = NETWORKS;
