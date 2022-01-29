/* eslint-disable */
var http = require("http");

const READ_ONLY_URL = 'http://127.0.0.1:40403';

const interval = setInterval(() => {
    const req = http.get(
      `${READ_ONLY_URL}/version`,
      {},
      (resp) => {
        if (resp.statusCode !== 200) {
          console.log('Status code different from 200', 'error');
          console.log(resp.statusCode);
          process.exit();
        }
  
        resp.setEncoding('utf8');
        let rawData = '';
        resp.on('data', (chunk) => {
          rawData += chunk;
        });
  
        resp.on('end', () => {
          rnodeVersion = rawData;
          const req2 = http.get(
            `${READ_ONLY_URL}/api/blocks/1`,
            {},
            (resp2) => {
              if (resp2.statusCode !== 200) {
                console.log(
                  'rnode observer blocks api not ready (1), will try again in 10s'
                );
                return;
              }
  
              resp2.setEncoding('utf8');
              let rawData2 = '';
              resp2.on('data', (chunk) => {
                rawData2 += chunk;
              });
              resp2.on('end', () => {
                if (typeof JSON.parse(rawData2)[0].blockHash === 'string') {
                  console.log(`${rawData}\n`);
                  console.log(
                    `RChain node responding at ${READ_ONLY_URL}/version and /api/blocks/1`
                  );
                  // RCHAIN READY
                }
              });
              resp2.on('error', (err) => {
                throw new Error(err);
              });
            }
          );
  
          req2.end();
          req2.on('error', (err) => {
            console.log(err);
            console.log('rnode observer blocks api not ready (2), will try again in 10s');
          });
        });
        resp.on('error', (err) => {
          throw new Error(err);
        });
      }
    );
    req.end();
    req.on('error', (err) => {
      console.log('rnode observer not ready, will try again in 10s');
    });
  }, 10000);
