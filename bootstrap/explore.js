#!/usr/local/bin/node

const rchainToolkit = require('rchain-toolkit');
const fs = require('fs');

const READ_ONLY_HOST = 'http://localhost:40403';
const rholang_files = process.argv.slice(2);

const explore = async (rholang_f) => {
    const rholang = fs.readFileSync(rholang_f, 'utf8');
    try {
      const result = await rchainToolkit.http.exploreDeploy(READ_ONLY_HOST, {
        term: rholang,
      });
      console.log(result);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  for(let i=0; i<rholang_files.length; i++){
  explore(rholang_files[i]);
  }