#!/usr/bin/env node

const { check_rnode } = require('./cli-utils/check-rnode_script');
const ALLNETWORKS = require('./cli-utils/networks');

// TODO: allow user to specify network on the command line
const pid = check_rnode(ALLNETWORKS, 'localhost');

// TODO: allow user to specify --quiet to supporess the console output
if (pid == 0) {
  console.log("rnode is not running. Use run-rnode to start");
  return false;
} else {
  console.log(`rnode is running as PID ${pid}. Use stop-rnode to stop`);
  return true;
}
