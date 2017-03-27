const https = require('https')
const url = require('url')
const { createContext } = require('../utils/utils.js')


class HttpsProxy {
  constructor(options) {
    this.port = option.port
    this.proxy = null
    this.handlersMap = {}
  }

  on(event, cb) {
    // register to the handlers queue
    this.handlesMap[event] = cb
  }

  start(cb) {
    // check CA

    this.proxy = https.createServer({
      // key:
      // cert: 
      SNICallback: function(servername, cb) {
        const secureContext = createContext(servername, certBase)
        cb(null, secureContext)
      }
    })
  }

  _attachHandlers() {
    Object.keys(this.handlersMap).forEach(event => {
      this.proxy.on(event, this.handlersMap[event])
    })
  }
}

module.exports = HttpsProxy
