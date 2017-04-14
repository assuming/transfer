const CertBase = require('cert-base')
const HttpProxy = require('./proxy/http-proxy.js')
const HttpsProxy = require('./proxy/https-proxy.js')
const MapServer = require('./mapper/map-server.js')
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
      mapRules,
      opensslPath
    } = this.options
    
    // init cert base
    this.certBase = new CertBase({
      // path: CERTBASE_PATH,
      path: CERTBASE_PATH_TEST,
      subject: TRANSFER_SUBJECT,
      opensslPath: opensslPath
    })

    // init 2 proxies and a map server
    this.httpProxy = new HttpProxy({ port: httpPort })
    this.httpsProxy = new HttpsProxy({
      port: httpsPort,
      certBase: this.certBase
    })
    this.mapServer = new MapServer(mapRules)
  }

  async start() {
    await this._checkCAStatus()

    const { 
      interceptor,
      mapRules,
      httpsPort,
      httpsWhiteList,
      allHttpsDecryption
    } = this.options
    
    // init map local server
    const mapSvrInfo = this.mapServer.start()
    
    // init handlers
    const requestHandler = makeRequestHandler(interceptor, mapSvrInfo.port, mapRules)
    const connectHandler = makeConnectHandler(httpsPort, httpsWhiteList, allHttpsDecryption)
    
    // start 2 servers
    const httpProxyInfo = await this.httpProxy
      .on('request', requestHandler)
      .on('connect', connectHandler)
      .start()
    const httpsProxyInfo = await this.httpsProxy
      .on('request', requestHandler)
      .start()
    
    return {
      httpProxy: httpProxyInfo,
      httpsProxy: httpsProxyInfo,
      mapServer: mapSvrInfo
    }
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
