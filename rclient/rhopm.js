// @ts-check

const { getDataForDeploy } = require('../rnode-client/rnode-web');

const phloConfig = { phloPrice: 1, phloLimit: 250000 };

/**
 *
 * @param {string} src
 * @param {Validator} validator
 * @param {Observer} observer
 * @param {(dd: DeployData) => DeployRequest} sign
 * @param {{ readFile: TODOType, clock: () => Date }} io
 *
 * @typedef { any } TODOType
 */
export async function deploy1(src, validator, observer, sign, { readFile, clock }) {
  const term = await readFile(src, 'utf8');

  console.log('get recent block from', observer.apiBase());
  const [{ blockNumber: validAfterBlockNumber }] = await observer.getBlocks(1);
  const timestamp = clock().valueOf();

  const signed = sign({ term, timestamp, validAfterBlockNumber, ...phloConfig });
  console.log('deploy:', { term: term.slice(0, 24), validAfterBlockNumber, api: validator.apiBase() });

  const deployResult = await validator.deploy(signed);
  console.log('deployed', src, { deployResult });

  const onProgress = async () => {
    console.log('standing by for return from', src, '...');
    return false;
  };
  const dataForDeploy = await getDataForDeploy(observer, signed.signature, onProgress, { setTimeout, clearTimeout });
  console.log('value from', src, dataForDeploy);
  return { dataForDeploy, signed };
}
