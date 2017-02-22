const CenterProxy = require('./proxy/center-proxy.js');

class Transfer {
  constructor(options) {
    const { port } = options;

    this.port = port;
    this.centerProxy = new CenterProxy();
  }

  start() {
    this.centerProxy.run(this.port);
  }

  stop() {}
}

module.exports = Transfer;