/* eslint-disable */
const execShell = require('./exec-script');

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

    const formatted_string = shell_output.replace(/\r?\n|\r/g, ' ');
    // console.log(
    //   `rnode is currently running as process ${formatted_string}. Use ./stop-rnode to stop it`,
    // );
    return formatted_string;
  }
}
