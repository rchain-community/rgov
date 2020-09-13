// @ts-check

const { getDataForDeploy } = require('../rnode-client/rnode-web');

const phloConfig = { phloPrice: 1, phloLimit: 250000 };

/**
 * @param {string} src
 * @param {string} term
 * @param {number} timestamp
 * @param {Validator} validator
 * @param {Observer} observer
 * @param {(dd: DeployData) => DeployRequest} sign
 */
export async function deploy1(src, term, timestamp, validator, observer, sign) {
  console.log('@@@', { src, imports: findImports(term) });

  console.log('get recent block from', observer.apiBase());
  const [{ blockNumber: validAfterBlockNumber }] = await observer.getBlocks(1);

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

export const importPattern = /match\s*\("import",\s*"(?<specifier>[^"]+)",\s*`(?<uri>rho:id:[^`]*)`\)/g;

/**
 * @param {string} term
 * @returns { string[] }
 */
export function findImports(term) {
  return [...term.matchAll(importPattern)].map(m => notNull(m.groups).specifier);
}

/**
 *
 * @param {string} src
 * @param {string} term
 * @param {{[specifier: string]: string}} uriByDep
 */
export function fixupImports(src, term, uriByDep) {
  const each = (_match, specifier, _uri) => {
    const dep = specifier.replace(/^\.\//, ''); // TODO: more path resolution?
    const uri = uriByDep[dep];
    if (!uri) {
      throw new Error(`failed to satisfy ${src} -> ${dep} dependency among ${Object.keys(uriByDep)}`);
    }
    return `match ("import", "${specifier}", \`${uri}\`)`
  };
  return term.replace(importPattern, each);
}

/**
 * @template T
 * @param {undefined | T} x
 * @returns {T}
 */
function notNull(x) {
  if (!x) { throw new Error('null!'); }
  return x;
}
