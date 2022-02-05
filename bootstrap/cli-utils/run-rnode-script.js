/* eslint-disable */
const execShell = require('./exec-script');
const fs = require('fs');
const { checkRnode } = require('./check-rnode-script');

module.exports = {
  // TODO: respect the ALLNETWORKS and network arguments
  runRnode: async (ALLNETWORKS, network, privatekey_f, logfile_f) => {
    //get current pid for rnode
    const pid = await checkRnode();

    if (pid != 0) {
      console.log(`rnode is currently running. Use 'kill ${pid}' to fix`);
      return;
    }

    const privateKey = fs.readFileSync(privatekey_f, 'utf8');

    // TODO: I think the await here is wrong because of the TODO item located below
    await execShell(
      `rnode run -s --validator-private-key "${privateKey}" --dev-mode -XX:MaxDirectMemorySize=100m -XX:MaxRAMPercentage=25 > ${logfile_f} 2>&1 &`
    )

    // TODO: read the last line of ${logfile_f} until we see "Making a transition to Running state."
  }
}
