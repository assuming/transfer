const fmt = require('fmt-obj');

/**
 * Print Object in a pretty way
 */
exports.logJSON = function (obj) {
  console.log(fmt(obj));
};

/**
 * Log keys in an Object
 */
exports.logKeys = function (obj) {
  Object.keys(obj).forEach(k => console.log(k));
};

// TODO: error log warn level printer