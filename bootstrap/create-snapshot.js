#!/usr/bin/env node

/* eslint-disable */
const { create_snapshot } = require('./cli-utils/create-snapshot-script');

const arg_input = process.argv.slice(2);
 
if (arg_input.length < 1){
    console.log('Please provide snapshot name');
    process.exit();
}

for (i=0; i<arg_input.length; i++) {
create_snapshot(arg_input[i]);
}
