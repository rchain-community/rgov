/* eslint-disable */

const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

module.exports = {
  easyDeploy: async (
    console,
    ALLNETWORKS,
    rholang_f,
    privateKeyFile,
    network_argument,
  ) => {
    const rholang = fs.readFileSync(rholang_f, 'utf8');

    const privateKey = fs.readFileSync(privateKeyFile, 'utf8');

    let dataAtNameResponse;
    try {
      dataAtNameResponse = await rchainToolkit.http.easyDeploy(
        ALLNETWORKS[network_argument].observerBase,
        rholang,
        privateKey,
        1,
        1000000000,
        400000
      );
    } catch (err) {
      console.log(err);
      throw new Error('deployBox 01');
    }

    const data = rchainToolkit.utils.rhoValToJs(
      JSON.parse(dataAtNameResponse).exprs[0].expr
    );
    console.log(data);
    return data;
  }
}
