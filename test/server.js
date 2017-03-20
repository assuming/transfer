const Transfer = require('../src/index.js')

/**
 * Setup proxy
 */

const proxy = new Transfer({ port: 7777 })
proxy.start()