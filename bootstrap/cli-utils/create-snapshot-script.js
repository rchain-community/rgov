/* eslint-disable */
const fs = require('fs');
const exec_shell = require('./exec-script');
//const { stop_rnode } = require('./stop-rnode-script');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

module.exports = { 
  create_snapshot: (name_of_snapshot) => {
  try {
    //take snapshot name from arg
    const arg_input = name_of_snapshot;
    console.log(arg_input);

    // check if .rnode dir exist
    const homedir = require('os').homedir();
    if (!fs.existsSync(homedir + '/.rnode')) {
      console.log(`Cannot snapshot: ${homedir}/.rnode does not exist`);
      rl.close();
      return {message:"failed"};
    }

    //run stop node script
    const cp = require('child_process').fork('stop-rnode.js');
    cp.on('close', async (code, signal) => {
      //if stop script terminates with error, exit
      if (code === 1) {
        rl.close();
        return {message:"failed"};
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
              reply.toLocaleLowerCase() === 'yes' ||
              reply.toLocaleLowerCase() === 'y'
            ) {
              await exec_shell(`cd ~ && tar czf "${target}" .rnode`);
              console.log(`snapshot created: ${target}`);
              rl.close();
              return {message:"successful"};
            } else {
              console.log('Aborting...');
              rl.close();
              return {message:"failed"}
            }
          },
        );
      } else {
        await exec_shell(`cd ~ && tar czf "${target}" .rnode`);
        console.log(`snapshot created: ${target}`);
        rl.close();
        return {message:"successful"};
      }
    });

    // create snapshot dir
  } catch (error) {
    console.log(error);
  }
}
}
