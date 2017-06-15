const Transfer = require('../build/index')

/**
 * Setup proxy
 */

const transfer = new Transfer({ 
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhiteList: [
    'baidu.com',
    'zhihu.com',
    'google.com'
  ],
  blackList: ['ohmyxm.xyz'],
  opensslPath: '/usr/local/Cellar/openssl/1.0.2k/bin/openssl'
})
transfer
  .on('request', data => {
    console.log(`${data.method} -> ${data.url}`)

    console.log('---request---')
    console.log(data.request)
  })
  .on('response', data => {
    console.log('---response---')
    console.log(data)
  })
  .on('error', err => {
    console.log('\n--------- ERROR ---------')
    throw err
  })
  .start()
  .then(data => {
    console.log(`Transfer start running at ${data.http.port} & ${data.https.port}`)
  })

// setTimeout(function() {
  
// }, 2000);