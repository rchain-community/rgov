/* eslint-disable */
const exec_shell = require('./exec_script');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const { check_rnode } = require('./check-rnode_script');

module.exports = {
  stop_rnode: async () => {
    //get current pid for rnode
    const pid = check_rnode();

    if (pid == 0) {
      console.log("No rnode running, use ./run-rnode to start one")
      return;
    }

    const formatted_string = pid;
    console.log(
      `rnode is currently running. Use 'kill ${formatted_string}' to fix`,
    );
    rl.question(`Execute 'kill ${formatted_string}' [y]? `, async (reply) => {
      if (
        reply.toLocaleLowerCase() === 'yes' ||
        reply.toLocaleLowerCase() === 'y' ||
        reply.toLocaleLowerCase() === ''
      ) {
        await exec_shell(`kill ${formatted_string}`);
      } else {
        console.log('Aborted');
      }
      rl.close();
    });
  }
}
