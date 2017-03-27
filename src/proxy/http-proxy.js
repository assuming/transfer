const http = require('http')
const url = require('url')

class HttpProxy {
  constructor(options) {
    this.port = options.port
    this.proxy = http.createServer()
    this.handlersMap = {}
  }

  on(event, cb) {
    // register to the handlers queue
    this.handlesMap[event] = cb
    return this
  }

  async start() {
    this._attachListeners()
  
    // start proxy
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

  async stop() {

  }

  _attachHandlers() {
    Object.keys(this.handlersMap).forEach(event => {
      this.proxy.on(event, this.handlersMap[event])
    })
  }
}

module.exports = HttpProxy
