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
  https: require('https'),
  env: process.env,
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

const SRCS = [
  'kudos.rho',
  'inbox.rho',
  'Issue.rho',
  'directory.rho',
  'memberIdGovRev.rho',
  // 'Community.rho',
];
const TARGETS = Object.fromEntries(
  SRCS.map((src) => [src, rhopm.rhoInfoPath(src)]),
);

/**
 * See also https://github.com/rchain-community/rchain-docker-shard
 * https://github.com/rchain-community/liquid-democracy/issues/17
 * https://github.com/tgrospic/rnode-client-js
 */
const { shard, account } = ((net) => {
  const acct = (shard, pk) =>
    makeAccount(
      pk,
      shard.observer,
      {
        setTimeout: io.sched.setTimeout,
        clock: io.clock,
        period: 7500,
      },
      { phloPrice: 1, phloLimit: 250000 },
    );
  switch (net) {
    case 'local': {
      const shard = rhopm.shardIO(
        io.fs.readFileSync('docker-shard/.env', 'utf8'),
        io.http,
        io.sched,
      );
      return { shard, account: acct(shard, shard.env.VALIDATOR_BOOT_PRIVATE) };
    }
    case 'testnet': {
      const api = {
        // TODO: rotate validators
        boot: 'https://node2.testnet.rchain-dev.tk',
        read: 'https://observer.testnet.rchain.coop',
      };
      // TODO: narrow http usage to request()
      // so http and https are compatible
      const https = io.https;
      const shard = rhopm.shardAccess(io.env, api, https, {
        setInterval,
        clearInterval,
      });
      const pk = io.env.VALIDATOR_BOOT_PRIVATE;
      if (!pk) throw new RangeError('missing VALIDATOR_BOOT_PRIVATE');
      return { shard, account: acct(shard, pk) };
    }

    // TODO: factor out overlap with testnet
    case 'mainnet': {
      const api = {
        // TODO: rotate validators
        read: 'https://observer.services.mainnet.rchain.coop',
        boot: 'https://node12.root-shard.mainnet.rchain.coop',
      };
      // TODO: narrow http usage to request()
      // so http and https are compatible
      const https = io.https;
      const shard = rhopm.shardAccess(io.env, api, https, {
        setInterval,
        clearInterval,
      });
      const pk = io.env.VALIDATOR_BOOT_PRIVATE;
      if (!pk) throw new RangeError('missing VALIDATOR_BOOT_PRIVATE');
      return { shard, account: acct(shard, pk) };
    }

    default:
      throw new TypeError(net);
    // return { shard: 1, account: 2 };
  }
})(process.env.NETWORK || 'local');

desc(`deploy ${SRCS}`);
task('default', ['startShard', rhopm.rhoDir, ...Object.values(TARGETS)], () => {
  console.log({ SRCS });
});

desc('start local shard with validator, observer');
task('startShard', [], () => {
  if (io.env.NETWORK !== 'local') return;
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

contractTask('kudos.rho');
contractTask('inbox.rho');
contractTask('directory.rho');
contractTask('memberIdGovRev.rho', ['inbox.rho', 'directory.rho']);
contractTask('Issue.rho');
// contractTask('Community.rho', ['directory.rho']);
