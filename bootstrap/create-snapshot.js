#!/usr/bin/env node

/* eslint-disable */
const { create_snapshot } = require('./cli-utils/create-snapshot-script');

const arg_input = process.argv.slice(2);

create_snapshot(arg_input);
