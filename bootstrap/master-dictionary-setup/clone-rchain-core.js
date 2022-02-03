/* eslint-disable */
const fs = require('fs');
const path = require('path');

const console = require('console');

const shell = require('../cli-utils/exec-script');

// clone rchain files from github
const cloneRchainCore = async () => {
const directory = path.join(__dirname, '../rchain');

try {
    if (!fs.existsSync(directory)) {
        console.log('Cloning into rchain. This may take a while');
        await shell(`git clone https://github.com/rchain/rchain.git`)
    } else {
        console.log('rchain already exists, updating....')
        await shell(`cd rchain && git pull`);
    }
} catch (err) {
            console.log(err)
            return;
}
}
cloneRchainCore();