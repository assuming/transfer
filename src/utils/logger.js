const fmt = require('fmt-obj')

/**
 * Print Object in a pretty way
 */
exports.logJSON = function(obj) {
  console.log(fmt(obj))
}

// TODO: error log warn level printer
