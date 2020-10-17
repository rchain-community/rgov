/**
 * Jakefile - tasks to manage deployment of contracts
 *
 * See https://jakejs.com/
 */
// @ts-check

'use strict';

const io = {
  sched: { setTimeout, clearTimeout, setInterval, clearInterval },
  clock: () => Promise.resolve(Date.now()),
  fs: require('fs'),
  http: require('http'),
  exec: require('child_process').execSync,
};
const jake = require('jake');
// @ts-ignore
const { desc, directory, task } = jake;

// Our own libraries are written as ES6 modules.
// eslint-disable-next-line no-global-assign
require = require('esm')(module);
const { rhopm, makeAccount, signDeploy: sign } = require('rchain-api');

/**
 * BEGIN project-specific tasks and dependencies.
 */

const SRCS = ['inbox.rho', 'directory.rho', 'Community.rho'];
const TARGETS = Object.fromEntries(
  SRCS.map((src) => [src, rhopm.rhoInfoPath(src)]),
);

/**
 * See also https://github.com/rchain-community/rchain-docker-shard
 * https://github.com/rchain-community/liquid-democracy/issues/17
 * https://github.com/tgrospic/rnode-client-js
 */
const shard = rhopm.shardIO(
  io.fs.readFileSync('docker-shard/.env', 'utf8'),
  io.http,
  io.sched,
);

const account = makeAccount(
  shard.env.VALIDATOR_BOOT_PRIVATE,
  shard.observer,
  {
    setTimeout: io.sched.setTimeout,
    clock: io.clock,
    period: 7500,
  },
  { phloPrice: 1, phloLimit: 250000 },
);

desc(`deploy ${SRCS}`);
task('default', ['startShard', rhopm.rhoDir, ...Object.values(TARGETS)], () => {
  console.log({ SRCS });
});

desc('start local shard with validator, observer');
task('startShard', [], () => {
  io.exec('docker-compose up -d', { cwd: 'docker-shard' });
  console.log(
    'TODO: wait for "MultiParentCasper instance created." in the log',
  );
});

directory(rhopm.rhoDir);

const contractTask = rhopm.makeContractTask(TARGETS, {
  jake,
  io: io.fs.promises,
  shard,
  account,
});

contractTask('inbox.rho');
contractTask('directory.rho');
contractTask('Community.rho', ['directory.rho']);
