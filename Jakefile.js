/* eslint-disable prettier/prettier */
/**
 * Jakefile - tasks to manage deployment of contracts
 *
 * See https://jakejs.com/
 */
// @ts-check

'use strict';

const io = {
  sched: { setTimeout, clearTimeout, setInterval, clearInterval },
  clock: () => new Date(),
  // eslint-disable-next-line global-require
  fs: require('fs'),
  // eslint-disable-next-line global-require
  http: require('http'),
  // eslint-disable-next-line global-require
  exec: require('child_process').execSync,
};
const jake = require('jake');
// @ts-ignore
const { desc, directory, task } = jake;

// Our own libraries are written as ES6 modules.
// eslint-disable-next-line no-global-assign
require = require('esm')(module);
const { rhopm, signDeploy: sign } = require('rchain-api');

/**
 * BEGIN project-specific tasks and dependencies.
 */

const SRCS = ['inbox.rho', 'directory.rho', 'Community.rho'];
const TARGETS = Object.fromEntries(
  SRCS.map((src) => [src, rhopm.rhoInfoPath(src)]),
);

// TODO: refactor:
//  - move ./rclient (i.e. rhopm) to RChain-API
//  - use io.fs.readFileSync to get shard URLs, account key
//  - use io.http.request + URLs to make validator, observer
//  - use validator + io.sched to make CapTP-like proxy to deployerId
//  - rhopm needs proxy

/**
 * See also https://github.com/rchain-community/rchain-docker-shard
 * https://github.com/rchain-community/liquid-democracy/issues/17
 * https://github.com/tgrospic/rnode-client-js
 */
const shard = rhopm.shardIO(io.fs.readFileSync, io.http, io.sched);
const signWithKey = (dd) =>
  sign(shard.env.VALIDATOR_BOOT_PRIVATE, {
    ...dd,
    phloPrice: 1,
    phloLimit: 250000,
  });

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
  io,
  shard,
  signWithKey,
});

contractTask('inbox.rho');
contractTask('directory.rho');
contractTask('Community.rho', ['directory.rho']);
