const chalk = require('chalk')
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
    console.log(`${chalk.green(data.method)} -> ${data.url}`)

    console.log(chalk.blue('---request---'))
    console.log(data)
    console.log('\n')
  })
  .on('response', data => {
    console.log(chalk.yellow('---response---'))
    console.log(data)
    console.log('\n')
  })
  .on('error', err => {
    console.log(chalk.red('\n--------- ERROR ---------'))
    throw err
  })
  .start()
  .then(data => {
    console.log(`Transfer start running at ${data.http.port} & ${data.https.port}`)
  })

setTimeout(function() {
  transfer.stop()
    .then(() => {
      console.log('Transfer shutdown')
    })
    .catch(e => {
      throw e
    })
}, 2000);