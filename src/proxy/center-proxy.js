const http = require('http')
const https = require('https')

const makeRequestHandler = require('./request-handler.js')
const makeConnectHandler = require('./connect-handler.js')
const SecureProxy = require('./secure-proxy.js')


class CenterProxy {
  constructor(options) {
    const { 
      httpPort,
      httpsPort,
      httpsWhiteList,
      interceptors,
      allHttpsDecryption
    } = options

    // setup options
    this.options = options
    
    this.requestHandler = makeRequestHandler(interceptors)
    this.connectHandler = makeConnectHandler(httpsPort, httpsWhiteList, allHttpsDecryption)
    
    // 2 servers
    this.proxy = http.createServer()
    this.secureProxy = new SecureProxy()
  }

  start(cb) {
    const { httpPort, httpsPort } = this.options

    this.proxy
      .on('request', this.requestHandler)
      .on('connect', this.connectHandler)
      .listen(httpPort)
      
    this.secureProxy
      .on('request', this.requestHandler)
      .listen(httpsPort)
  }

  stop(cb) {

  }
}

module.exports = CenterProxy
