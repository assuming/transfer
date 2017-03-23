const url = require('url')

/**
 * Check Transfer init options for safety
 */

exports.checkOptions = function(options) {
  const result = { ...options }
  const {
    httpPort,
    httpsPort,
    httpsWhiteList,
    interceptprs,
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
 * Check if a given host matches anything in the white list
 */

exports.isInList = function(hostname, list) {
  for (let domain of list) {
    const regString = domain.split('.').join('\\\\.')
    const reg = new RegExp(`${regString}$`, "gi")

    if (reg.test(hostname)) {
      return true
    }
  }

  return false
}
