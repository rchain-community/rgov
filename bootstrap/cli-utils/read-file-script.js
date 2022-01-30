/* eslint-disable */
var http = require("http");
var filename = process.argv[2];


if (!filename)
    return console.log("Usage: node tailServer filename");

var spawn = require('child_process').spawn;
var tail = spawn('tail', ['-f', filename]);

http.createServer(function (request, response) {
    console.log('request starting...');

    response.writeHead(200, {'Content-Type': 'text/plain' });

    tail.stdout.on('data', function (data) {
      response.write('' + data);                
    });
}).listen(8088);