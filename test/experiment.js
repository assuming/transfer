const path = require('path')
const chalk = require('chalk')
const Transfer = require('../build/index')

/**
 * Setup proxy
 */

const transfer = new Transfer({ 
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhitelist: [
    'baidu.com',
    'zhihu.com',
    'google.com',
  ],
  // mapRules: {
  //   'http://ohmyxm.xyz': 'http://e.r.rg.v..ad/.sda/da'
  // },
  // blacklist: [],
  // opensslPath: '/usr/local/Cellar/openssl/1.0.2k/bin/openssl',
  // certsPath: path.join(__dirname, '../certs'),
})
transfer
  .on('request', data => {
    console.log(`${chalk.green(data.method)} -> ${data.url}`)

    // console.log(chalk.blue('---request---'))
    // console.log(data)
    // console.log('\n')
  })
  // .on('response', data => {
  //   // console.log(chalk.yellow('---response---'))
  //   // console.log(data)
  //   // console.log('\n')
  // })
  .on('error', err => {
    console.log(chalk.red('\n--------- ERROR ---------'))
    console.log(err.code)
    // throw err
  })
  .start()
  .then(data => {
    console.log(`Transfer start running at ${data.http.port} & ${data.https.port}`)
  })