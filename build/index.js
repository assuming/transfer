const CenterProxy = require('./proxy/center-proxy.js');

class Transfer {
  constructor(options) {
    this.centerProxy = new CenterProxy();
  }

  start() {
    this.centerProxy.run();
  }

  stop() {}
}

module.exports = Transfer;