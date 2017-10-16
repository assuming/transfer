import Koa from 'koa'
import http from 'http'
import https from 'https'
import tls from 'tls'
import Events from 'events'
import util from 'util'
import CertBase from 'cert-base'
import portfinder from 'portfinder'
import createConnectHandler from './handlers/connect-handler'
import makeReactive from './utils/reactive'
import closable from './utils/closable'
import { stopServer } from './utils/utils'

// constants
import {
  TRANSFER_SUBJECT,
  HTTPS_SERVER_COMMONNAME,
  DEFAULT_INIT_OPTIONS
} from './constants/configs'


// middlewares
import createCaChecker from './middlewares/ca'
import createUrlResolver from './middlewares/resolver'
import createInterceptor from './middlewares/interceptor'
import createBlocker from './middlewares/blocker'
import createMapper from './middlewares/mapper'
import createSender from './middlewares/sender'

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
      ...options
    }
    this.hotOptions = makeReactive({
      httpsWhitelist: this.options.httpsWhitelist,
      blacklist: this.options.blacklist,
      mapRules: this.options.mapRules
    })
    this.app = new Koa()
    this.certs = new CertBase({
      path: this.options.certsPath,
      opensslPath: this.options.opensslPath,
      subject: TRANSFER_SUBJECT,
    })

    // initialize all the middlewares
    this._install()
  }

  /**
   * Start the transfer and returns the proxy status
   */

  async start() {
    await this._mount()
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
   * Update methods for hot options
   */

  updateHttpsWhitelist(newVal) {
    this.hotOptions.httpsWhitelist = newVal
  }
  updateBlacklist(newVal) {
    this.hotOptions.blacklist = newVal
  }
  updateMapRules(newVal) {
    this.hotOptions.mapRules = newVal
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
   * List the current signed certs
   */

  async listCerts() {
    return await this.certs.listSignedCerts()
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

  _install() {
    this.app
      .use(createCaChecker(this.options.certsPath))
      .use(createUrlResolver())
      .use(createInterceptor(this))
      .use(createBlocker(this.hotOptions))
      .use(createMapper(this.hotOptions))
      .use(createSender(this))

    this.app.on('error', (err, ctx) => {
      // TODO: maybe some custom handling
      this.emit('error', err, ctx)
    })
  }

  /**
   * Create 2 proxies and mount koa to them
   */

  async _mount() {
    const reqHandler = this.app.callback()
    const { port, caCertName } = this.options

    // start http server here for port assign for https server
    this.httpProxy = closable(http.createServer(reqHandler)).listen(port)
    const httpsPort = await portfinder.getPortPromise()
    this.httpProxy.on('connect', createConnectHandler(httpsPort, this.hotOptions, this))

    // ensure that CA exist
    if (!this.certs.isCAExist()) {
      await this.certs.createCACert(caCertName)
    }
    
    // create a cert pair for https server instance
    const httpsPair = await this.certs.getCertByHost(HTTPS_SERVER_COMMONNAME)

    this.httpsProxy = closable(https.createServer({
      key: httpsPair.key,
      cert: httpsPair.cert,
      SNICallback: async (servername, cb) => {
        const pair = await this.certs.getCertByHost(servername)
        cb(null, tls.createSecureContext(pair))
      }
    }, reqHandler)).listen(httpsPort)
  }
}

module.exports = Transfer