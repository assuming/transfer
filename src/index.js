const Koa = require('koa')
const http = require('http')
const https = require('https')
const tls = require('tls')
const Events = require('events')
const util = require('util')
const CertBase = require('cert-base')
const createConnectHandler = require('./handlers/connect-handler')
const { checkOptions, stopServer } = require('./utils/utils')

// constants
const {
  TRANSFER_SUBJECT,
  CA_CERT_COMMONNAME,
  HTTPS_SERVER_COMMONNAME,
  DEFAULT_INIT_OPTIONS
} = require('./constants/configs')


// middlewares
const createUrlResolver = require('./middlewares/resolver')
const createInterceptor = require('./middlewares/interceptor')
const createBlocker = require('./middlewares/blocker')
const createMapper = require('./middlewares/mapper')
const createSender = require('./middlewares/sender')

/**
 * Transfer itself is an event emitter
 * 
 * @class Transfer
 * @extends {Events}
 */

class Transfer extends Events {
  constructor(options) {
    super()
    this.options = {
      ...DEFAULT_INIT_OPTIONS,
      ...checkOptions(options)
    }
    this.app = new Koa()
    this.certs = new CertBase({
      path: this.options.certsPath,
      subject: TRANSFER_SUBJECT,
      opensslPath: this.options.opensslPath
    })

    // initialize all the middlewares
    this.install()
  }

  /**
   * Start the transfer and returns the proxy status
   */

  async start() {
    await this.mount()
    return this.getStatus()
  }

  /**
   * Programmatically stop the proxy
   */

  async stop() {
    const httpAddr = this.httpProxy.address()
    const httpsAddr = this.httpsProxy.address()

    // if already stopped, do nothing
    if (httpAddr && httpsAddr) {
      return Promise.all([
        stopServer(this.httpProxy),
        stopServer(this.httpsProxy)
      ])
    }
  }

  /**
   * Get the 2 proxy address info
   *
   * @returns Object with server address
   */

  getStatus() {
    return {
      http: this.httpProxy.address(),
      https: this.httpsProxy.address()
    }
  }

  /**
   * List the current certs
   */

  async listCerts() {
    return await this.certs.listCerts()
  }

  /**
   * Remove cert from the cert base
   * 
   * @param {String} domain name of the cert you want to remove
   *                        * means you want to remove all of them 
   */

  async removeCert(domain) {
    if (domain === '*') {
      return await this.certs.removeAllCerts()
    }

    return await this.certs.removeCert(domain)
  }
  
  /**
   * Install middlewares into app and listen for errors
   */

  install() {
    this.app
      .use(createUrlResolver())
      .use(createInterceptor(this))
      .use(createBlocker(this.options.blacklist))
      .use(createMapper(this.options.mapRules))
      .use(createSender(this))

    this.app.on('error', (err, ctx) => {
      // TODO: maybe some custom handling
      this.emit('error', err, ctx)
    })
  }

  /**
   * Create 2 proxies and mount koa to them
   */

  async mount() {
    const { httpPort, httpsPort, httpsWhitelist } = this.options

    // common request and CONNECT event handler
    const reqHandler = this.app.callback()
    const connectHandler = createConnectHandler(httpsPort, httpsWhitelist, this)

    // ensure that CA exist
    if (!this.certs.isCAExist()) {
      await this.certs.createCACert(CA_CERT_COMMONNAME)
    }

    // http proxy server needs to listen to CONNECT event
    this.httpProxy = http.createServer()
      .on('request', reqHandler)
      .on('connect', connectHandler)
      .listen(httpPort)
    
    // create a cert pair for https server instance
    const httpsPair = await this.certs.getCertByHost(HTTPS_SERVER_COMMONNAME)

    this.httpsProxy = https.createServer({
      key: httpsPair.key,
      cert: httpsPair.cert,
      SNICallback: async (servername, cb) => {
        const pair = await this.certs.getCertByHost(servername)
        cb(null, tls.createSecureContext(pair))
      }
    }, reqHandler).listen(httpsPort)
  }
}

module.exports = Transfer