const exec_shell = require('./util/exec_script');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const main = async () => {
  //get current pid for rnode
  const shell_output = await exec_shell(
    `ps aux |grep -v grep | grep "java .*rnode"|sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 2`,
  );
  if (!shell_output) {
    rl.close();
    return;
  }
  const formatted_string = shell_output.replace(/\r?\n|\r/g, ' ');
  console.log(
    `rnode is currently running. Use 'kill ${formatted_string}' to fix`,
  );
  rl.question(`Execute 'kill ${formatted_string}' [y]? `, async (reply) => {
    if (
      reply.toLocaleLowerCase() === 'yes' ||
      reply.toLocaleLowerCase() === 'y'
    ) {
      await exec_shell(`kill ${formatted_string}`);
    } else {
      console.log('Aborting ...');
    }
    rl.close();
  });
};

main();
