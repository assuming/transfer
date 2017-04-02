const https = require('https')
const url = require('url')
const tls = require('tls')
const { CA_CERT_COMMONNAME } = require('../constants/configs.js')

class HttpsProxy {
  constructor(options) {
    this.port = options.port
    this.certBase = options.certBase
    this.proxy = null
    this.handlersMap = {}
  }

  on(event, cb) {
    this.handlersMap[event] = cb
    return this
  }

  async start() {
    // init server
    const ca = await this._getCA()
    this.proxy = https.createServer({
      key: ca.key,
      cert: ca.cert,
      SNICallback: (servername, cb) => {
        console.log(servername)
        // cb(null, tls.createSecureContext({
        //   key: ``,
        //   cert: ``
        // }))
        this._getCert(servername)
          .then(data => {
            cb(null, tls.createSecureContext(data))
          })
      }
    })
    
    // bind listeners
    this._attachHandlers()

    return new Promise((resolve, reject) => {
      this.proxy.listen(this.port, e => {
        if (!e) {
          resolve(true)
        } else {
          reject(e)
        }
      })
    })
  }

  _attachHandlers() {
    Object.keys(this.handlersMap).forEach(event => {
      this.proxy.on(event, this.handlersMap[event])
    })
  }
  async _getCA() {
    let ca = {}

    try {
      ca = await this.certBase.getCACert()
    } catch (e) {
      ca = await this.certBase.createCACert(CA_CERT_COMMONNAME)
    }

    return ca
  }
  async _getCert(hostname) {
    const cert = await this.certBase.getCertByHost(hostname)
    return cert
  }
}

module.exports = HttpsProxy
