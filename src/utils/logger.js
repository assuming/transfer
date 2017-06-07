const fmt = require('fmt-obj')
const chalk = require('chalk')


/**
 * Print request url to console with color
 */

exports.printReq = function(options) {
  const methodString = chalk.green(options.method)
  console.log(`${methodString} -> ${options.url.href}`)
}

/**
 * Log keys in an Object
 */

exports.logKeys = function(obj) {
  Object.keys(obj).forEach(k => console.log(k))
}

// TODO: error log warn level printer
