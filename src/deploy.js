// @ts-check

import {
   getEthProvider,
   MetaMaskAccount,
   getAddrFromEth,
   signMetaMask,
   startTerm,
   listenAtDeployId,
} from 'rchain-api';

/**
   @typedef { import('rchain-api').Observer } Observer
   @typedef { import('rchain-api').Validator } Validator
   @typedef { import('rchain-api/src/rnode').RNodeAdmin } RNodeAdmin
   @typedef { import('rchain-api').RhoExpr } RhoExpr
 * @typedef { import('rchain-api').DeployRequest } DeployRequest
*/

/**
 *
 * @typedef {{
 *   sign: (term: string) => Promise<DeployRequest>,
 *   polling: () => Promise<void>, // throws to abort
 * }} Account
 */

/**
 *
 * @param {string?} term
 * @param {{ observerBase: Observer, validatorBase: Validator, adminBase: import('rchain-api/src/rnode').RNodeAdmin }} shard
 * @param { import('rchain-api/src/proxy').Account } account
 * @returns {Promise<{problem: any|string, results: RhoExpr[]}>}
 */
export async function deploy(term, shard, account) {
   if (!term) {
      return { problem: "No rholang", results: []}
   }

   const obs = shard.observerBase;
   const val = shard.validatorBase;
   const adm = shard.adminBase;

   try {
      // await busy(
      //    '#deploy',
         await (async () => {
            const deploy = await startTerm(term, val, obs, account);
            console.log('@@DEBUG', term, { deploy });
            let deployId = deploy.sig;
            const { expr } = await listenAtDeployId(obs, deploy);
            console.log('@@DEBUG', term, { expr });
            return {problem: null, results: [expr]}
         })()
      // );
      // TODO? $('#blockInfo').textContent = pprint(block);
   } catch (err) {
      return {problem: err.message, results: []}
   }


}


