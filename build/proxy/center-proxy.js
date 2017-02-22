const http = require('http');
const requestHandler = require('./request-handler.js');
const connectHandler = require('./connect-handler.js');

class CenterProxy {
  constructor() {
    this.server = http.createServer();
  }

  run(port, hostname = '0.0.0.0') {

    this.server.on('request', requestHandler)
    // .on('connect', connectHandler)
    .listen(port, hostname);
  }
}

module.exports = CenterProxy;