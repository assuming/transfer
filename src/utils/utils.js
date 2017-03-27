const url = require('url')
const tls = require('tls')

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
 * Make path for '~/'
 */

exports.getHomePath = function() {
  // TODO: maybe I can get Windows support, but I'm lazy
  return process.env.HOME
}

/**
 * Check if a given host matches anything in the white list
 */

exports.isInList = function(hostname, list) {
  for (let domain of list) {
    const regString = domain.split('.').join('\\\\.')
    // e.g. /\.github\.com$/gi
    const reg = new RegExp(`\\.${regString}$`, "gi")

    // same string
    if (hostname === domain) return true
    // not same string, but matches
    if (reg.test(hostname)) return true
  }

  return false
}

/**
 * Create secure context for SNI
 */

exports.createContext = function(servername) {


  tls.createSecureContext({
    // key: 
    // cert:
  })
}