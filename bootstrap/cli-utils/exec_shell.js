const { execSync } = require('child_process');
//const ls = exec('ls', ['-lh', '/usr']);

 // execute shell script within node js
 function exec_shell(cmd) {
   return new Promise((resolve, reject) => {
     execSync(cmd, (err, stdout, _stdin) => {
       if (err) throw err;
       resolve(stdout);
            
     });
   });
 }

 module.exports = exec_shell;
