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
const jake = require('jake');
// @ts-ignore
const { desc, directory, task } = jake;

// Our own libraries are written as ES6 modules.
require = require('esm')(module);
const { sign } = require('./rclient/deploySig');
const { shardIO, rhoInfoPath, rhoDir, makeContractTask } = require('./rclient/rhopm');

const { fromEntries, values } = Object;

/**
 * BEGIN project-specific tasks and dependencies.
 */

const SRCS = ['inbox.rho', 'directory.rho', 'Community.rho'];
const TARGETS = fromEntries(SRCS.map(src => [src, rhoInfoPath(src)]));

/**
 * See also https://github.com/rchain-community/rchain-docker-shard
 * https://github.com/rchain-community/liquid-democracy/issues/17
 * https://github.com/tgrospic/rnode-client-js
 */
let shard = shardIO(io.fs.readFileSync, io.http, io.sched);
const signWithKey = dd => sign(shard.env.VALIDATOR_BOOT_PRIVATE, dd)

desc(`deploy ${SRCS}`);
task('default', ['startShard', rhoDir, ...values(TARGETS)], {concurrency: 1}, () => {
  console.log({ SRCS });
});

desc('start local shard with validator, observer')
task('startShard', [], () => {
  io.exec('docker-compose up -d', { cwd: 'docker-shard' });
  console.log('TODO: wait for "MultiParentCasper instance created." in the log');
});

directory(rhoDir);

let contractTask = makeContractTask(TARGETS, { jake, io, shard, signWithKey });

contractTask('inbox.rho')
contractTask('directory.rho')
contractTask('Community.rho', ['directory.rho']);
