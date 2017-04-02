const http = require('http')
const url = require('url')

class HttpProxy {
  constructor(options) {
    this.port = options.port
    this.proxy = http.createServer()
    this.handlersMap = {}
  }

  on(event, cb) {
    this.handlersMap[event] = cb
    return this
  }

  async start() {
    this._attachHandlers()
  
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

  _attachHandlers() {
    Object.keys(this.handlersMap).forEach(event => {
      this.proxy.on(event, this.handlersMap[event])
    })
  }
}

module.exports = HttpProxy
