/**
 * Jakefile - tasks to manage deployment of contracts
 *
 * See https://jakejs.com/
 */
'use strict';
const io = {
  fs: require('fs'),
  http: require('http'),
  exec: require('child_process').execSync,
  clock: () => new Date(),
};
const { desc, directory, task } = require('jake');

// Our own libraries are written as ES6 modules.
require = require('esm')(module);
const { nodeFetch } = require('./rclient/curl');
const { RNode } = require('./rclient/rnode');
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
}

let shard = ((readFileSync, http, dotEnv = 'docker-shard/.env') => {
  const fetch = nodeFetch({ http });
  const env = parseEnv(readFileSync(dotEnv, 'utf8'));
  const api = {
    boot: `http://${env.MY_NET_IP}:40403`,
    read: `http://${env.MY_NET_IP}:40413`,
  };
  return freeze({
    env, ...api,
    validator: RNode(fetch, api.boot),
    observer: RNode(fetch, api.read),
  });
})(io.fs.readFileSync, io.http);

directory(',deployed');

SRCS.forEach(src => {
  desc(`deploy ${src}`);
  task(`,deployed/${src}`, [src, ',deployed', 'startShard'], async () => {
    const term = await io.fs.promises.readFile(src, 'utf8');

    console.log('get recent block from', shard.read);
    const [{ blockNumber: validAfterBlockNumber }] = await shard.observer.getBlocks(1);
    const timestamp = io.clock().valueOf();

    const signed = sign(shard.env.WALLET_PRIVATE,
      { term, timestamp, validAfterBlockNumber, ...phloConfig });
    console.log('deploy:', { term: term.slice(0, 24), api: shard.boot });

    await shard.validator.deploy(signed);
    console.log('TODO: get result');
  });
});

desc('deploy *.rho');
task('default', SRCS.map(src => `,deployed/${src}`), {concurrency: 4}, () => {
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
