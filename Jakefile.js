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
const { deploy1 } = require('./rclient/rhopm');

const { freeze, fromEntries, values } = Object;

const SRCS = ['inbox.rho', 'directory.rho', 'Community.rho'];
const TARGETS = fromEntries(SRCS.map(src => [src, `rho_modules/${src.replace(/\.rho$/, '.json')}`]));

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

let shard = ((readFileSync, http, sched, dotEnv = 'docker-shard/.env') => {
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
  const pid = sched.setInterval(() => {
    if (!proposing) {
      proposing = true;
      proposer.propose()
      .then(() => { proposing = false; })
      .catch(_err => { proposing = false; })
    }
  }, 2 * SECOND);

  return freeze({
    env, ...api,
    validator: rnode.validator(api.boot),
    observer: rnode.observer(api.read),
    stopProposing: () => sched.clearInterval(pid),
  });
})(io.fs.readFileSync, io.http, io.sched);

directory('rho_modules');

SRCS.forEach(src => {
  desc(`deploy ${src}`);
  file(TARGETS[src], [src], async () => {
    const signWithKey = dd => sign(shard.env.VALIDATOR_BOOT_PRIVATE, dd)
    const { dataForDeploy, signed } = await deploy1(src, shard.validator, shard.observer, signWithKey,
      { readFile: io.fs.promises.readFile, clock: io.clock })

    console.log('info from', src, dataForDeploy);
    await io.fs.promises.writeFile(TARGETS[src], JSON.stringify({ src, signed, dataForDeploy }, null, 2));
  });
});

desc('deploy *.rho');
task('default', ['startShard', 'rho_modules', ...values(TARGETS)], {concurrency: 1}, () => {
  console.log({ SRCS });
  shard.stopProposing();
});


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
