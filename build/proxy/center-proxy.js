const http = require('http');
const requestHandler = require('./request-handler.js');
const connectHandler = require('./connect-handler.js');

class CenterProxy {
  constructor(options) {
    this.options = options;
    this.server = http.createServer();
  }

  run() {
    const { port } = this.options;

    this.server.on('request', requestHandler)
    // .on('connect', connectHandler)
    .listen(port, '0.0.0.0');
  }
}

module.exports = CenterProxy;