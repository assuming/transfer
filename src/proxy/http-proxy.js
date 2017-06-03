const http = require('http')
const url = require('url')

class HttpProxy {
  constructor(options) {
    this.port = options.port
    this.proxy = http.createServer()
    this.handlersMap = {}
  }

  start() {
    this._attachHandlers()
    this.proxy.listen(this.port)
  }
  stop() {

  }
  
  getInfo() {
    return {
      port: this.port
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

module.exports = HttpProxy
