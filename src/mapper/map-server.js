const http = require('http')
const https = require('https')
const url = require('url')
const createMapRequestHandler = require('./map-request-handler.js')
const { 
  httpsCheck,
  findMappedPath
} = require('../utils/utils')


/**
 * Map local server for serving local files
 */

class MapServer {
  constructor(mapRules) {
    this.server = http.createServer()
    this.mapRules = mapRules
  }

  start() {
    const requestHandler = createMapRequestHandler()
    
    this.server
      .on('request', requestHandler)
      .listen()
    this.port = this.server.address().port
  }
  
  getInfo() {
    return {
      port: this.port,
      mapRules: this.mapRules
    }
  }

  /**
   * Filter the url in the rules and return the final destination
   */

  mapFilter(urlString, options) {
    const dest = this.checkRules(urlString)

    let protocol = http
    let newOptions = {}
    
    if (dest.type === 'none' || dest.type === 'remote') {
      const isHttps = httpsCheck(dest.mappedUrl)
      const defaultPort = isHttps ? 443 : 80
      protocol = isHttps ? https : http

      // form the url options
      const reqData = url.parse(dest.mappedUrl)
      newOptions = {
        host: reqData.hostname,
        port: reqData.port || defaultPort,
        path: reqData.path
      }
    } else {
      newOptions = {
        host: '127.0.0.1',
        port: this.port,
        path: dest.mappedUrl,
        method: 'GET'
      }
    }

    return { 
      options: {
        ...options,
        ...newOptions
      }, 
      protocol 
    }
  }

  checkRules(urlString) {
    // check local rules first
    for (let rule of Object.keys(this.mapRules.local)) {
      const result = findMappedPath(urlString, {
        rule: rule,
        target: this.mapRules.local[rule]
      })

      if (result) {
        return {
          type: 'local',
          mappedUrl: result
        }
      }
    }

    // check remote rules
    for (let rule of Object.keys(this.mapRules.remote)) {
      const result = findMappedPath(urlString, {
        rule: rule,
        target: this.mapRules.remote[rule]
      })

      if (result) {
        return {
          type: 'remote',
          mappedUrl: result
        }
      }
    }

    return {
      type: 'none',
      mappedUrl: mappedUrl
    }
  }
}

module.exports = MapServer
