/* eslint-disable */

const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');
const path = require('path');

module.exports = {
  deploy: async (
    console,
    ALLNETWORKS,
    rholang_f,
    privateKeyFile,
    network_argument
  ) => {
    // Get user input and use that to select a pk file
    if (privateKeyFile) {
      const privateKey = fs.readFileSync(privateKeyFile, 'utf8');
      const publicKey = rchainToolkit.utils.publicKeyFromPrivateKey(privateKey);

      console.log(`deploying ${rholang_f}`);
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
        100000000,
        validAfterBlockNumber,
      );

      let deployResponse;
      try {
        deployResponse = await rchainToolkit.http.deploy(
          ALLNETWORKS[network_argument].observerBase,
          deployOptions
        );
      } catch (err) {
        console.log(err);
      }
      console.log('response from deploy', deployResponse);
      return deployResponse;
    }
  },
};
