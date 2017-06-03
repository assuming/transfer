const https = require('https')
const url = require('url')
const tls = require('tls')
const CertBase = require('cert-base')
const {
  CERTBASE_PATH,
  CERTBASE_PATH_TEST,
  TRANSFER_SUBJECT,
  CA_CERT_COMMONNAME,
  HTTPS_SERVER_COMMONNAME
} = require('../constants/configs.js')


class HttpsProxy {
  constructor(options) {
    this.port = options.port
    this.httpsWhiteList = options.httpsWhiteList
    this.certBase = new CertBase({
      // path: CERTBASE_PATH,
      path: CERTBASE_PATH_TEST,
      subject: TRANSFER_SUBJECT,
      opensslPath: options.opensslPath
    })

    this.proxy = null
    this.handlersMap = {}
  }

  async start() {
    // ensure that CA exist
    if (!this.certBase.isCAExist()) {
      await this.certBase.createCACert(CA_CERT_COMMONNAME)
    }

    // create a cert for https server instance
    const httpsPair = await this.certBase.getCertByHost(HTTPS_SERVER_COMMONNAME)
    this.proxy = https.createServer({
      key: httpsPair.key,
      cert: httpsPair.cert,
      SNICallback: async (servername, cb) => {
        const pair = await this.certBase.getCertByHost(servername)
        cb(null, tls.createSecureContext(pair))
      }
    })
    
    // bind listeners && start proxy
    this._attachHandlers()
    this.proxy.listen(this.port)
  }

  async stop() {

  }

  async listCerts() {
    return await this.certBase.listCerts()
  }
  async removeCert(domain) {
    if (domain === '*') {
      return await this.certBase.removeAllCerts()
    }
    
    return await this.certBase.removeCert(domain)
  }

  getInfo() {
    return {
      port: this.port,
      httpsWhiteList: this.httpsWhiteList
    }
  }

  on(event, cb) {
    this.handlersMap[event] = cb
    return this
  }

  _attachHandlers() {
    Object.keys(this.handlersMap).forEach(event => {
      this.proxy.on(event, this.handlersMap[event])
    })
  }
}

module.exports = HttpsProxy
