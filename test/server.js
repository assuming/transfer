const path = require('path')
const chalk = require('chalk')
const Transfer = require('../build/index')

/**
 * Setup proxy
 */

const transfer = new Transfer({ 
  port: 7777,
  httpsWhitelist: [
    'baidu.com',
    'zhihu.com',
    'google.com'
  ],
  mapRules: {
    'http://ohmyxm.xyz': '/Users/ohmyxm/Code/transfer/README.md'
  },
  certsPath: path.join(__dirname, '../certs'),
  blacklist: [],
  opensslPath: '/usr/local/Cellar/openssl/1.0.2k/bin/openssl',
  caCertName: 'Transfer Proxy Test CA'
})
transfer
  .on('request', data => {
    console.log(`${chalk.green(data.method)} -> ${data.url}`)

    // console.log(chalk.blue('---request---'))
    // console.log(data)
    // console.log('\n')
  })
  .on('response', data => {
    // console.log(chalk.yellow('---response---'))
    // console.log(data)
    // console.log('\n')
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
  console.log('changing whitelist')
  transfer.updateHttpsWhitelist([])
}, 5000)