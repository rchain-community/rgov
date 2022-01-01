#!/usr/local/bin/node

/* eslint-disable */
const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const ALLNETWORKS = require('./cli-utils/networks');
//  const READ_ONLY_HOST = 'http://localhost:40403';
const rholang_files = process.argv.slice(2);

// TODO allow user input --network as a command argument
const network_argument = 'rhobot'

const explore = async (rholang_f) => {
    const rholang = fs.readFileSync(rholang_f, 'utf8');
    try {
      const result = await rchainToolkit.http.exploreDeploy(ALLNETWORKS[network_argument].observerBase, {
        term: rholang,
      });
      return result;
    } catch (e) {
      console.log(e);
    }
  }

 for(let i=0; i<rholang_files.length; i++){
  const return_value = explore(rholang_files[i]);
  return_value.then(function(result){
    console.log(result)
    })
  }