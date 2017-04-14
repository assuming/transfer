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

  start() {
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
}

module.exports = HttpProxy
