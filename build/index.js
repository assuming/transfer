const CenterProxy = require('./proxy/center-proxy.js');

const defaultOptions = {
  httpPort: 7777,
  httpsPort: 7778
};

class Transfer {
  constructor(options) {
    const _options = {};

    this.centerProxy = new CenterProxy(options);
  }

  start() {
    this.centerProxy.start();
  }

  stop() {
    this.centerProxy.stop();
  }
}

module.exports = Transfer;