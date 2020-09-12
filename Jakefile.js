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
const { desc, directory, task } = require('jake');

// Our own libraries are written as ES6 modules.
require = require('esm')(module);
const { nodeFetch } = require('./rclient/curl');
const { RNode } = require('./rclient/rnode');
const { getDataForDeploy } = require('./rnode-client/rnode-web');
const { sign } = require('./rclient/deploySig');

const { freeze } = Object;
const phloConfig = { phloPrice: 1, phloLimit: 250000 };

const SRCS = ['inbox.rho', 'directory.rho', 'Community.rho'];

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

  const proposer =  rnode.admin(api.admin);
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
    stopProposing: () => sched.cancelInterval(pid),
  });
})(io.fs.readFileSync, io.http, io.sched);

directory(',deployed');

SRCS.forEach(src => {
  desc(`deploy ${src}`);
  task(`,deployed/${src}`, [src, ',deployed', 'startShard'], async () => {
    const term = await io.fs.promises.readFile(src, 'utf8');

    console.log('get recent block from', shard.read);
    const [{ blockNumber: validAfterBlockNumber }] = await shard.observer.getBlocks(1);
    const timestamp = io.clock().valueOf();

    const signed = sign(shard.env.VALIDATOR_BOOT_PRIVATE,
      { term, timestamp, validAfterBlockNumber, ...phloConfig });
    console.log('deploy:', { term: term.slice(0, 24), api: shard.boot });

    const deployResult = await shard.validator.deploy(signed);
    console.log('deployed', src, { deployResult });

    const onProgress = async () => {
      console.log('standing by for return from', src, '...');
      return false;
    }
    const value = await getDataForDeploy(shard.observer, signed.signature, onProgress, { setTimeout, clearTimeout });
    console.log('value from', src, value);
  });
});

desc('deploy *.rho');
task('default', SRCS.map(src => `,deployed/${src}`), {concurrency: 1}, () => {
  console.log({ SRCS });
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
