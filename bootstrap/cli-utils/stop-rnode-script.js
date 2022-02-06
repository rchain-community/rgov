/* eslint-disable */
const execShell = require('./exec-script');

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
    }
  }
}
