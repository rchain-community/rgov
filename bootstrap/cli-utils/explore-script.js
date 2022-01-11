/* eslint-disable */

const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const rholang_files = process.argv.slice(2);

// TODO allow user input --network as a command argument
const network_argument = 'rhobot'

module.exports = {
  explore: async (
    console,
    ALLNETWORKS,
    rholang_f,
    privateKeyFile,
    network_argument,
    ) => {
      const rl = fs.readFileSync(rholang_f, 'utf8');
      const rholang = rl
        .replace(/ (`rho:rchain:deployId`)/g, '')
        .replace(/ (`rho:rchain:deployerId`)/g, '')
        .replace(/\/\/.*/, ' ');
      try {
        const result = await rchainToolkit.http.exploreDeploy(ALLNETWORKS[network_argument].observerBase, {
          term: rholang,
        });
        return result;
      } catch (e) {
        console.log(e);
      }
    }
}
