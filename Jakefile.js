/**
 * Jakefile - tasks to manage deployment of contracts
 *
 * See https://jakejs.com/
 */
// @ts-check
'use strict';
const io = {
  sched: { setInterval, clearInterval },
  clock: () => new Date(),
  fs: require('fs'),
  http: require('http'),
  exec: require('child_process').execSync,
};
// @ts-ignore
const { desc, directory, file, task } = require('jake');

// Our own libraries are written as ES6 modules.
require = require('esm')(module);
const { nodeFetch } = require('./rclient/curl');
const { RNode } = require('./rclient/rnode');
const { sign } = require('./rclient/deploySig');
const { deploy1, fixupImports } = require('./rclient/rhopm');

const { freeze, fromEntries, values } = Object;

const SRCS = ['inbox.rho', 'directory.rho', 'Community.rho'];
const rhoInfoPath = src => `rho_modules/${src.replace(/\.rho$/, '.json')}`;
const TARGETS = fromEntries(SRCS.map(src => [src, rhoInfoPath(src)]));

let shard = shardIO(io.fs.readFileSync, io.http, io.sched);
const signWithKey = dd => sign(shard.env.VALIDATOR_BOOT_PRIVATE, dd)

desc('deploy *.rho');
task('default', ['startShard', 'rho_modules', ...values(TARGETS)], {concurrency: 1}, () => {
  console.log({ SRCS });
});

directory('rho_modules');

contract('inbox.rho')
contract('directory.rho')
contract('Community.rho', ['directory.rho']);

function contract(src, deps = []) {
  console.log('@@setting up task for', TARGETS[src], src);
  desc(`deploy ${src}`);
  const depTargets = deps.map(d => TARGETS[d]);
  file(TARGETS[src], [src, ...depTargets], async () => {
    console.log('reading', { depTargets });
    const reading = depTargets.map(fn => io.fs.promises.readFile(fn, 'utf8'));
    const info = (await Promise.all(reading)).map(txt => JSON.parse(txt));
    const byDep = fromEntries(info.map(
      ({ src, dataForDeploy: { data: { expr: { ExprUri: { data: uri } }}}}) => [src, uri]));
    console.log({src, byDep});
    const termRaw = await io.fs.promises.readFile(src, 'utf8');
    const term = fixupImports(src, termRaw, byDep);
    shard.startProposing();
    const { dataForDeploy, signed } = await deploy1(src, term, io.clock().valueOf(), shard.validator, shard.observer, signWithKey);
    shard.stopProposing();

    console.log('info from', src, dataForDeploy);
    await io.fs.promises.writeFile(TARGETS[src], JSON.stringify({ src, signed, dataForDeploy }, null, 2));
  });
}


exports.startShard = startShard;
/**
 * See also https://github.com/rchain-community/rchain-docker-shard
 * https://github.com/rchain-community/liquid-democracy/issues/17
 * https://github.com/tgrospic/rnode-client-js
 */
function startShard() {
  io.exec('docker-compose up -d', { cwd: 'docker-shard' });
  console.log('TODO: wait for "MultiParentCasper instance created." in the log');
}

function shardIO(readFileSync, http, sched, dotEnv = 'docker-shard/.env') {
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
