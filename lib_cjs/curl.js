/**
 * @param {string} url
 * @param {{ http: any }} powers
 * @returns {Promise<string>}
 */
function curl(url, { http }) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, response => {
      let str = '';
      // console.log('Response is ' + response.statusCode);
      response.on('data', chunk => {
        str += chunk;
      });
      response.on('end', () => resolve(str));
    });
    req.end();
    req.on('error', reject);
  });
}
exports.curl = curl;
