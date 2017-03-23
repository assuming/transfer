const Transfer = require('../src/index.js')

/**
 * Setup proxy
 */

const proxy = new Transfer({ 
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhiteList: [
    'baidu.com',
    'github.com'
  ],
  allHttpsDecryption: false
})
proxy.start()