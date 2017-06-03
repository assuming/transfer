const HttpProxy = require('./proxy/http-proxy.js')
const HttpsProxy = require('./proxy/https-proxy.js')
const MapServer = require('./mapper/map-server.js')
const Interceptor = require('./interceptors/interceptor.js')
const { checkOptions } = require('./utils/utils.js')

const { 
  DEFAULT_INIT_OPTIONS,
} = require('./constants/configs')


class Transfer {
  constructor(options) {
    this.options = {
      ...DEFAULT_INIT_OPTIONS,
      ...checkOptions(options)
    }

    const {
      httpPort,
      httpsPort,
      opensslPath,
      httpsWhiteList,
      mapRules,
      blackList,
    } = this.options

    this.httpProxy = new HttpProxy({ port: httpPort })
    this.httpsProxy = new HttpsProxy({
      port: httpsPort,
      opensslPath: opensslPath,
      httpsWhiteList: httpsWhiteList
    })
    this.mapServer = new MapServer(mapRules)
    this.interceptor = new Interceptor(blackList)
  }

  async start() {
    // init local map server and get port && rules
    this.mapServer.start()
    
    // init handlers
    const requestHandler = createRequestHandler(this.interceptor, this.mapServer.mapFilter)
    const connectHandler = createConnectHandler(this.httpsProxy.getInfo())

    // init 2 proxies
    await this.httpProxy
      .on('request', requestHandler)
      .on('connect', connectHandler)
      .start()
    await this.httpsProxy
      .on('request', requestHandler)
      .start()

    return this.getServersInfo()
  }

  stop() {

  }

  getTransferInfo() {
    return {
      httpProxy: this.httpProxy.getInfo(),
      httpsProxy: this.httpsProxy.getInfo(),
      mapServer: this.mapServer.getInfo()
    }
  }

  on(event, cb) {
    this.interceptor.on(event, cb)
    return this
  }

  /**
   * HTTPS cert management
   */

  async listCerts() {
    return await this.httpsProxy.listCerts()
  }
  async removeCert(domain) {
    return await this.httpsProxy.removeCert(domain)
  }
}