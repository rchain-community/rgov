// @ts-check

/**
 * @typedef { import('rchain-api').Observer } Observer
 * @typedef { import('rchain-api').Validator } Validator
 * @typedef { import('rchain-api/src/rnode').RNodeAdmin } RNodeAdmin
 * @typedef {{ observerBase: Observer, validatorBase: Validator, adminBase: import('rchain-api/src/rnode').RNodeAdmin }} 
 shardBase
 * @typedef {{ hostPattern: hostname, shard: Object }} net
*/

/**
 *
 * @param { string } pattern
 * @param { string } obs
 * @param { string } val
 * @param { string } adm
 * @returns {net}
 */
function makeNetwork(pattern, obs, val, adm) {
   return Object.freeze({
      hostPattern: pattern,
      shard: {
      observerBase: obs,
      validatorBase: val,
      adminBase:adm
      }
   })
}

// TODO: ISSUE: are networks really const? i.e. design-time data?
// TODO the strings for the URLs should be URL types, not strings
/**
 * @typedef {string} hostname
 *
 * @type {{ localhost: net, testnet: net, demo: net, rhobot: net, mainnet: net}} NETWORKS
 */
const NETWORKS = Object.freeze({
   localhost:
      makeNetwork(
      'localhost',
      'http://localhost:40403',
      'http://localhost:40403',
      'http://localhost:40405'
      ),
   testnet: makeNetwork(
      'test',
      'https://observer.testnet.rchain.coop',
      // TODO: rotate validators
      'https://node1.testnet.rchain-dev.tk',
      '',
   ),
   demo: makeNetwork(
      'demo',
      'https://demoapi.rhobot.net',
      // TODO: rotate validators
      'https://demoapi.rhobot.net',
      'https://demoadmin.rhobot.net',
   ),
   rhobot: makeNetwork(
      'rhobot',
      'https://rnodeapi.rhobot.net',
      // TODO: rotate validators
      'https://rnodeapi.rhobot.net',
      'https://rnodeadmin.rhobot.net',
   ),
   mainnet: makeNetwork(
      'mainnet',
      'https://observer.services.mainnet.rchain.coop',
      'https://node12.root-shard.mainnet.rchain.coop',
      '',
   ),
});

/**
 * @param {string} hostname
 * @returns {net}
 */
export function netFromHost(hostname) {

   Object.entries(NETWORKS).find(
      ([_name, net]) => {
          if (hostname.indexOf(net.hostPattern) >= 0) return net;
         })
   if (NETWORKS[hostname] === undefined ) return NETWORKS.mainnet;
         
   return NETWORKS[hostname];
}

/**
 * @returns {string[]}
 */
export function networkNames() {
   return Object.keys(NETWORKS)
}
