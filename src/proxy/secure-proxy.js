const https = require('https')
const url = require('url')
const { createContext } = require('../utils/utils.js')
// tmp test
const CertBase = require('../utils/cert-tmp.js')
// const CertBase = require('cert-base')


class SecureProxy {
  constructor() {
    this.proxy = null
  }

  on(event, cb) {

  }

  listen(port) {
    // check CA
    

    this.proxy = https.createServer({

    })
  }
}


const secureProxy = https.createServer({
  // key:
  // cert: 
  SNICallback: function(servername, cb) {
    const secureContext = createContext(servername, certBase)
    cb(null, secureContext)
  }
})

module.exports = secureProxy