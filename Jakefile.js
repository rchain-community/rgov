const { task, desc } = require('jake');
const exec = require('child_process').execSync;

exports.shard = shard;
/**
 * See also https://github.com/rchain-community/rchain-docker-shard
 * https://github.com/rchain-community/liquid-democracy/issues/17
 * https://github.com/tgrospic/rnode-client-js
 */
function shard() {
    exec('docker-compose up -d', { cwd: 'docker-shard' });
}
