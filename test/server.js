const Transfer = require('../build/index')

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
  // .on('request')
  // .on('response')
  // .on('transfer')
  .on('error', (err) => {
    console.log('\n--------- ERROR ---------')
    throw err
  })
  .start()
  .then(data => {
    console.log(`HTTP port: ${data.http.port}`)
    console.log(`HTTPS port: ${data.https.port}`)
    console.log('Transfer start running')
  })
