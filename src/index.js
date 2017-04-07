const CertBase = require('cert-base')
const HttpProxy = require('./proxy/http-proxy.js')
const HttpsProxy = require('./proxy/https-proxy.js')
const makeRequestHandler = require('./proxy/request-handler.js')
const makeConnectHandler = require('./proxy/connect-handler.js')
const { checkOptions } = require('./utils/utils.js')
const {
  defaultOptions,
  CERTBASE_PATH,
  CERTBASE_PATH_TEST,
  TRANSFER_SUBJECT,
  CA_CERT_COMMONNAME
} = require('./constants/configs.js')

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
      interceptors,
      opensslPath
    } = this.options
    
    // init cert base
    this.certBase = new CertBase({
      // path: CERTBASE_PATH,
      path: CERTBASE_PATH_TEST,
      subject: TRANSFER_SUBJECT,
      opensslPath: opensslPath
    })

    // event listeners
    this.requestHandler = makeRequestHandler(interceptors)
    this.connectHandler = makeConnectHandler(httpsPort, httpsWhiteList, allHttpsDecryption)

    // init 2 proxies
    this.httpProxy = new HttpProxy({ port: httpPort })
    this.httpsProxy = new HttpsProxy({
      port: httpsPort,
      certBase: this.certBase
    })
  }

  async start() {
    await this._checkCAStatus()

    await this.httpProxy
      .on('request', this.requestHandler)
      .on('connect', this.connectHandler)
      .start()

    await this.httpsProxy
      .on('request', this.requestHandler)
      .start()

    return true
  }

  async getCurrentCerts() {
    return this.certBase.listCerts()
  }

  async _checkCAStatus() {
    if (!this.certBase.isCAExist()) {
      return this.certBase.createCACert(CA_CERT_COMMONNAME)
    }
  }
}

module.exports = Transfer
