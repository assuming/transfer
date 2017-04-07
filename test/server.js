const Transfer = require('../build/index.js')

/**
 * Setup proxy
 */

const transfer = new Transfer({ 
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhiteList: [
    'baidu.com',
  ],
  allHttpsDecryption: false,
  opensslPath: '/usr/local/Cellar/openssl/1.0.2k/bin/openssl'
})
transfer.start()
  .then(() => {
    console.log('HTTP proxy start at localhost:7777')
    console.log('HTTPS proxy start at localhost:7778')
  })
  .catch(e => {
    throw e
  })
