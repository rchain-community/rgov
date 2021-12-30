#!/usr/bin/env node
const exec_shell = require('./util/exec_script');

const main = async () => {
  const shell_output = await exec_shell(
    `ps aux |grep -v grep | grep "java .*rnode"|sed 's/[ \t][ \t]*/ /g'|cut -d' ' -f 2`,
  );
  if (!shell_output) {
    console.log(
      `rnode is NOT currently running. Run "node run-rnode.js" to fix.`,
    );
  }
};

main();
