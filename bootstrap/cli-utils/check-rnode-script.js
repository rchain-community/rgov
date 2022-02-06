/* eslint-disable */
const execShell = require('./exec-script');

const { checkPort } = require('./check-port-script');
const { SingleEntryPlugin } = require('webpack');

module.exports = {
  // TODO: re-implement this to respect the ALLNETWORKS and network arguments
  checkRnode: async (ALLNETWORKS, network) => {
    //get current pid for rnode
    const shell_output = await execShell(
      `ps aux |grep -v grep | grep "java .*rnode"|sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 2`,
    );
    console.log(shell_output);

    if (!shell_output) {
      //console.log("No rnode running, use ./run-rnode to start one")
      return 0;
    }

    console.log("rnode is running")
    let open = await checkPort('localhost', [40401, 40402, 40403, 40404]);
    if (open.length != 4) {
      console.log("Waiting for ports to open")
      while (open.length != 4) {
        // const sleep = ms => new Promise(res => setTimeout(res, ms));
        // sleep(1000).then(_ => console.log("checking again"));
        open = await checkPort('localhost', [40401, 40402, 40403, 40404]);
      }
    }
    console.log(open)

    const formatted_string = shell_output.replace(/\r?\n|\r/g, ' ');
    // console.log(
    //   `rnode is currently running as process ${formatted_string}. Use ./stop-rnode to stop it`,
    // );
    return formatted_string;
  }
}
