const url = require('url')
const tls = require('tls')
const path = require('path')

/**
 * Check Transfer init options for safety
 */

exports.checkOptions = function(options) {
  const result = { 
    ...options 
  }
  const {
    httpPort,
    httpsPort,
    httpsWhiteList,
    allHttpsDecryption
  } = options

  // if only one port provided, use default ports
  // user must provide 2 ports
  if ((httpPort && !httpsPort) || (!httpPort && httpsPort)) {
    delete result.httpPort
    delete result.httpsPort
  }
  
  // if all https intercept, no need for white list
  if (result.allHttpsDecryption) {
    delete result.httpsWhiteList
  }

  return options
}

/**
 * Check req type, return true if https
 */

exports.httpsCheck = function(urlString) {
  const result = urlString.indexOf('http://') < 0 ? true : false
  return result
}

/**
 * Assemble URL using given host header and path (https server)
 */

exports.assembleURL = function(host, _path) {
  const _url = `https://${path.join(host, _path)}`
  return _url
}

/**
 * Make path for '~/'
 */

exports.getHomePath = function() {
  // TODO: maybe I can get Windows support, but I'm lazy
  return process.env.HOME
}

/**
 * Check if a given host matches any domain in the whitelist
 */

exports.isInList = function(hostname, list) {
  for (let domain of list) {
    const regString = domain.split('.').join('\\.')
    // e.g. /\.github\.com$/gi
    const reg = new RegExp(`\\.${regString}$`, "gi")

    // same string
    if (hostname === domain) return true
    // not same string, but matches
    if (reg.test(hostname)) return true
  }

  return false
}
