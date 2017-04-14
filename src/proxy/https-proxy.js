const https = require('https')
const url = require('url')
const tls = require('tls')

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
    const httpsPair = await this._getCert('Transfer HTTPS proxy')
    this.proxy = https.createServer({
      key: httpsPair.key,
      cert: httpsPair.cert,
      SNICallback: async (servername, cb) => {
        const pair = await this._getCert(servername)
        cb(null, tls.createSecureContext(pair))
      }
    })
    
    // bind listeners
    this._attachHandlers()
    this.proxy.listen(this.port)

    return {
      host: '0.0.0.0',
      port: this.port
    }
  }

  _attachHandlers() {
    Object.keys(this.handlersMap).forEach(event => {
      this.proxy.on(event, this.handlersMap[event])
    })
  }

  async _getCert(hostname) {
    const pair = await this.certBase.getCertByHost(hostname)
    return pair
  }
}

module.exports = HttpsProxy
