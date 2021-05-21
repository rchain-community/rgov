// @ts-check

import {
   getEthProvider,
   MetaMaskAccount,
   getAddrFromEth,
   signMetaMask,
   startTerm,
   listenAtDeployId,
} from 'rchain-api';

import m from 'mithril';
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

   const $ = (selector) => unwrap(document.querySelector(selector));
   const busy = makeBusy($, m.redraw);
   let result;

   try {
      await busy(
          '#deploy',
          (async () => {
            const deploy = await startTerm(term, val, obs, account);
            //console.log('@@DEBUG', term, { deploy });
            let deployId = deploy.sig;
            const { expr } = await listenAtDeployId(obs, deploy);
            result = expr;
            //console.log('@@DEBUG', term, { expr });
            console.log({problem: null, results: [expr]});
            
         })()
      );
      return {problem: null, results: [result]};

      // TODO? $('#blockInfo').textContent = pprint(block);
   } catch (err) {
      return {problem: err.message, results: []}
   }


}


/**
 * @param {(selector: string) => HTMLElement} $
 * @param { () => void } redraw
 */
 function makeBusy($, redraw) {
   /**
    * @param {string} selector
    * @param {Promise<T>} p
    * @returns {Promise<T>}
    *
    * @template T
    */
   async function busy(selector, p) {
     $('form').style.cursor = 'wait';
     const button = $(selector);
     if (!(button instanceof HTMLButtonElement)) throw TypeError(String(button));
     button.style.cursor = 'wait';
     button.disabled = true;
 
     try {
       const result = await p;
       return result;
     } finally {
       button.disabled = false;
       $('form').style.cursor = 'inherit';
       button.style.cursor = 'inherit';
       redraw();
     }
   }
   return busy;
 }

 /**
 * TODO: expect rather than unwrap (better diagnostics)
 *
 * @param {T?} x
 * @returns {T}
 * @template T
 */
function unwrap(x) {
   if (!x) throw new TypeError('unexpected null / undefined');
   return x;
 }
 


