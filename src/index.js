const HttpProxy = require('./proxy/http-proxy.js')
const HttpsProxy = require('./proxy/https-proxy.js')
const makeRequestHandler = require('./proxy/request-handler.js')
const makeConnectHandler = require('./proxy/connect-handler.js')
const checkOptions = require('./utils/utils.js')
const {
  defaultOptions,
  CERTBASE_PATH,
  TRANSFER_SUBJECT
} = require('./configs.js')
// just for testing
const { CertBase } = require('./utils/cert-tmp.js')

/**
 * Transfer
 */

class Transfer {
  constructor(options) {
    this.options = {
      ...defaultOptions,
      ...checkOptions(options)
    }

    const {
      httpPort,
      httpsPort,
      httpsWhiteList, 
      allHttpsDecryption,
      interceptors
    } = this.options
    
    // init cert base
    this.certBase = new CertBase({
      path: CERTBASE_PATH,
      subject: TRANSFER_SUBJECT
    })

    // event listeners
    this.requestHandler = makeRequestHandler(interceptors)
    this.connectHandler = makeConnectHandler(httpsPort, httpsWhiteList, allHttpsDecryption)

    // init 2 proxies
    this.httpProxy = new HttpProxy({ port: httpPort })
    this.httpsProxy = new HttpsProxy({
      port: httpsPort,
      // certBase: 
    })
  }

  async start() {
    await this.httpProxy
      .on('request', this.requestHandler)
      .on('connect', this.connectHandler)
      .start()

    await this.httpsProxy
      .on('request', this.requestHandler)
      .start()

    return true
  }

  async stop() {
  }
}

module.exports = Transfer
