/* eslint-disable */
const exec_shell = require('./exec_script');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

module.exports = {
   stop_rnode: async () => {
  //get current pid for rnode
  const shell_output = await exec_shell(
    `ps aux |grep -v grep | grep "java .*rnode"|sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 2`,
  );
  console.log(shell_output);
  if (!shell_output) {
    rl.close();
    console.log("No rnode running, use ./run-rnode to start one")
    return;
  }

  const formatted_string = shell_output.replace(/\r?\n|\r/g, ' ');
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
      console.log('Aborting ...');
    }
    rl.close();
  });
}
}
