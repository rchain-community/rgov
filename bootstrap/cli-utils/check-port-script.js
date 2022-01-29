/* eslint-disable */
const nodePortScanner = require('node-port-scanner');

module.exports = {
    check_port: async(host, port) => {
        const result = await nodePortScanner(host, port);
        console.log(result.ports.open);
        return result.ports.open;
    }
}