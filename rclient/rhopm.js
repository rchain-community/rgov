// @ts-check

const { getDataForDeploy } = require('../rnode-client/rnode-web');
const { nodeFetch } = require('./curl');
const { RNode } = require('./rnode');

const { keys, freeze, fromEntries } = Object;

const phloConfig = { phloPrice: 1, phloLimit: 250000 };

export const rhoDir = 'rho_modules';
export const rhoInfoPath = src => `${rhoDir}/${src.replace(/\.rho$/, '.json')}`;

export function makeContractTask(TARGETS, { jake, io, shard, signWithKey }) {
  const { fs: { promises: { readFile, writeFile } }, clock } = io;
  return function contractTask(src, deps = []) {
    const depTargets = deps.map(d => TARGETS[d]);
    jake.desc(`deploy ${src}${deps.length ? ' -> ' : ''}${deps}`);
    jake.file(TARGETS[src], [src, ...depTargets], async () => {
      const { signed, dataForDeploy } = await deployContract(src, depTargets, shard,
        { readFile: readFile, clock, signWithKey });
      await writeFile(TARGETS[src], JSON.stringify({ src, signed, dataForDeploy }, null, 2));
    });
  }
}


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


/**
 * @param {string} src
 * @param {string[]} depTargets
 */
export async function deployContract(src, depTargets, shard, { readFile, clock, signWithKey }) {
  console.log('reading', { depTargets });
  const reading = depTargets.map(fn => readFile(fn, 'utf8'));
  const info = (await Promise.all(reading)).map(txt => JSON.parse(txt));
  const byDep = fromEntries(info.map(
    ({ src, dataForDeploy: { data: { expr: { ExprUri: { data: uri } }}}}) => [src, uri]));
  console.log({src, byDep});
  const termRaw = await readFile(src, 'utf8');
  const term = fixupImports(src, termRaw, byDep);
  shard.startProposing();
  const { dataForDeploy, signed } = await deploy1(src, term, clock().valueOf(), shard.validator, shard.observer, signWithKey);
  shard.stopProposing();

  console.log('info from', src, dataForDeploy);
  return { signed, dataForDeploy };
};

export const importPattern = /match\s*\("import",\s*"(?<specifier>[^"]+)",\s*`(?<uri>rho:id:[^`]*)`\)/g;

/**
 * @param {string} term
 * @returns { string[] }
 */
export function findImports(term) {
  return [...term.matchAll(importPattern)].map(m => notNull(m.groups).specifier);
}

/**
 * @param {string} src
 * @param {string} term
 * @param {{[specifier: string]: string}} uriByDep
 */
export function fixupImports(src, term, uriByDep) {
  const each = (_match, specifier, _uri) => {
    const dep = specifier.replace(/^\.\//, ''); // TODO: more path resolution?
    const uri = uriByDep[dep];
    if (!uri) {
      throw new Error(`failed to satisfy ${src} -> ${dep} dependency among ${keys(uriByDep)}`);
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


export function shardIO(readFileSync, http, sched, dotEnv = 'docker-shard/.env') {
  const fetch = nodeFetch({ http });
  const env = parseEnv(readFileSync(dotEnv, 'utf8'));
  const api = {
    admin: `http://${env.MY_NET_IP}:40405`,
    boot: `http://${env.MY_NET_IP}:40403`,
    read: `http://${env.MY_NET_IP}:40413`,
  };
  const rnode = RNode(fetch);

  const proposer = rnode.admin(api.admin);
  const SECOND = 1000;
  let proposing = false;
  let waiters = 0;
  let pid;

  return freeze({
    env, ...api,
    validator: rnode.validator(api.boot),
    observer: rnode.observer(api.read),
    startProposing() {
      waiters += 1;
      if (typeof pid !== 'undefined') { return; }
      pid = sched.setInterval(() => {
        if (!proposing) {
          proposing = true;
          proposer.propose()
          .then(() => { proposing = false; })
          .catch(_err => { proposing = false; })
        }
      }, 2 * SECOND);
    },
    stopProposing() {
      if (waiters <= 0) { return; }
      waiters =- 1;
      sched.clearInterval(pid);
      pid = undefined;
    },
  });
}

function parseEnv(txt) {
  const env = {};
  for (const line of txt.split('\n')) {
    if (line.trim().startsWith('#')) { continue; }
    const parts = line.match(/(?<name>\w+)\s*=\s*(?<value>.*)/);
    if (!parts) { continue; }
    env[parts.groups.name] = parts.groups.value;
  }
  return env;
}
