#!/usr/bin/env node
const fs = require('fs');
const exec_shell = require('./util/exec_script');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const main = async () => {
  try {
    //take snapshot name from arg
    const arg_input = process.argv[2];
    if (arg_input === undefined) {
      console.log('Please specify snapshot name');
      rl.close();
      return;
    }

    //check if .rnode dir exist
    const homedir = require('os').homedir();
    if (!fs.existsSync(homedir + '/.rnode')) {
      console.log(`Cannot snapshot: ${homedir}/.rnode does not exist`);
      rl.close();
      return;
    }

    //run stop node script
    const cp = require('child_process').fork('stop-rnode.js');
    cp.on('close', async (code, signal) => {
      //if stop script terminates with error, exit
      if (code === 1) {
        rl.close();
        return;
      }
      fs.mkdirSync('snapshot', { recursive: true });
      const target = `${__dirname}/snapshot/${arg_input}.tgz`;

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
            } else {
              console.log('Aborting...');
              rl.close();
            }
          },
        );
      } else {
        await exec_shell(`cd ~ && tar czf "${target}" .rnode`);
        console.log(`snapshot created: ${target}`);
        rl.close();
      }
    });

    //create snapshot dir
  } catch (error) {
    console.log(error);
  }
};

main();
