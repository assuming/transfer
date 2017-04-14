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
  .then(data => {
    console.log(`HTTP proxy starts at ${data.httpProxy.host}:${data.httpProxy.port}`)
    console.log(`HTTPS proxy starts at ${data.httpsProxy.host}:${data.httpsProxy.port}`)
    console.log(`Local map server starts at ${data.mapServer.host}:${data.mapServer.port}`)
  })
  .catch(e => {
    throw e
  })
