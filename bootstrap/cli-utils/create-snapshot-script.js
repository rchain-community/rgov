/* eslint-disable */
const fs = require('fs');
const execShell = require('./exec-script');
//const { stopRnode } = require('./stop-rnode-script');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

module.exports = {
  createSnapshot: (name_of_snapshot) => {
  let result;

  try {
    //take snapshot name from arg
    const arg_input = name_of_snapshot;
    console.log(arg_input);

    // check if .rnode dir exist
    const homedir = require('os').homedir();
    if (!fs.existsSync(homedir + '/.rnode')) {
      console.log(`Cannot snapshot: ${homedir}/.rnode does not exist`);
      rl.close();
      return;
    }

    //run stop node script
    const cp = require('child_process').fork('stop-rnode');
    cp.on('close', async (code, signal) => {
      //if stop script terminates with error, exit
      if (code === 1) {
        rl.close();
        return;
      }

      fs.mkdirSync('snapshot', { recursive: true });
      const target = `${__dirname}/../snapshot/${arg_input}.tgz`;

     console.log(target);
      if (fs.existsSync(target)) {
        //if snapshot exist, alert user to override or exit

        rl.question(
          `Snapshot exist. Create new snapshot [y]? `,
          async (reply) => {
            if (
              reply.toLocaleLowerCase() === '' ||
              reply.toLocaleLowerCase() === 'yes' ||
              reply.toLocaleLowerCase() === 'y'
            ) {
              result = await execShell(`cd ~ && tar czf "${target}" .rnode`);
              console.log(`result: ${result}`);
              rl.close();
              return result;
            } else {
              console.log('Aborting...');
              rl.close();
            }
          },
        );
      } else {
        result = await execShell(`cd ~ && tar czf "${target}" .rnode`);
        console.log(`result: ${result}`);
        rl.close();
        return result;
      }
    });

    // create snapshot dir
  } catch (error) {
    console.log(error);
  }
}
}
