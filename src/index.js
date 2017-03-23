const CenterProxy = require('./proxy/center-proxy.js')
const { checkOptions } = require('./utils/utils.js')

/**
 * Default options
 *
 * httpPort       : port for http server also known as center server
 * 
 * httpsPort      : port for https intercepting server, use 
 *                  `httpPort + 1` when not provided
 *                  
 * httpsWhiteList : list for https domains that need to be intercepted
 *
 * interceptors   : interceptors
 */
const defaultOptions = {
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhiteList: [],
  interceptors: null,
  allHttpsDecryption: false
}

class Transfer {
  constructor(options) {
    const _options = {
      ...defaultOptions,
      ...checkOptions(options)
    }

    this.centerProxy = new CenterProxy(_options)
  }

  start() {
    this.centerProxy.start()
  }

  stop() {
    this.centerProxy.stop()
  }
}

module.exports = Transfer
