const http = require('http')
const https = require('https')
const requestHandler = require('./request-handler.js')
const connectHandler = require('./connect-handler.js')
const requestPrinter = require('./request-printer.js')

class CenterProxy {
  constructor() {
    // https server options
    const options = {}

    this.server = http.createServer()
    this.secureServer = https.createServer(options)
  }

  run(port, hostname='0.0.0.0') {
    this.server
      .on('request', requestHandler)
      .on('connect', connectHandler)
      .listen(port, hostname)
    
    // this.secureServer
    //   .on('request', )
    //   // TODO: port number limit
    //   .listen(port + 1, hostname)
  }
}

module.exports = CenterProxy
