const Transfer = require('../build/index.js')

/**
 * Setup proxy
 */

const transfer = new Transfer({ 
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhiteList: [
    'baidu.com',
    'zhihu.com'
  ],
  opensslPath: '/usr/local/Cellar/openssl/1.0.2k/bin/openssl'
})
transfer
  .on('request')
  .on('response')
  .on('transfer')
  .start()
  .then(data => {
    console.log(`HTTP proxy starts at localhost:${data.httpProxy.port}`)
    console.log(`HTTPS proxy starts at localhost:${data.httpsProxy.port}`)
    console.log(`Local map server starts at localhost:${data.mapServer.port}`)
  })
  .catch(e => {
    throw e
  })
