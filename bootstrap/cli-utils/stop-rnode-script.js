/* eslint-disable */
const execShell = require('./exec-script');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const { checkRnode } = require('./check-rnode-script');

module.exports = {
  stopRnode: async (force) => {
    //get current pid for rnode
    const pid = await checkRnode();

    if (pid == 0) {
      console.log("No rnode running, use node run-rnode.js to start one")
      process.exit();
    }
    else {
    const formatted_string = pid;
      await execShell(`kill ${formatted_string}`);
      console.log('rnode killed');
      process.exit();

    // console.log(
    //   `rnode is currently running. Use 'kill ${formatted_string}' to fix`,
    // );

    // rl.question(`Execute 'kill ${formatted_string}' [y]? `, async (reply) => {
    //   if (
    //     reply.toLocaleLowerCase() === 'yes' ||
    //     reply.toLocaleLowerCase() === 'y' ||
    //     reply.toLocaleLowerCase() === ''
    //   ) {
    //     await execShell(`kill ${formatted_string}`);
    //   } else {
    //     console.log('Aborted');
    //   }
    //   rl.close();
    // });
  }
  }
}
