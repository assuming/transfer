const path = require('path')
const fs = require('fs')

/**
 * Fake cert base
 */
class CertBase {
  constructor(options) {
    this.path = options.path

    this.CA_KEY_PATH = path.join(this.path, '##ca##-key.key')
    this.CA_CERT_PATH = path.join(this.path, '##ca##-cert.crt')

    this.USER_KEY_PATH = path.join(this.path, 'www.baidu.com-key.key')
    this.USER_CERT_PATH = path.join(this.path, 'www.baidu.com-cert.crt')

    // this.USER_KEY_PATH = path.join(this.path, '*.baidu.com-key.key')
    // this.USER_CERT_PATH = path.join(this.path, '*.baidu.com-cert.crt')
  }

  async createCACert(commonName) {
    return {
      key: fs.readFileSync(this.CA_KEY_PATH, 'utf8'),
      cert: fs.readFileSync(this.CA_CERT_PATH, 'utf8')
    }
  }

  async getCACert() {
    return {
      key: fs.readFileSync(this.CA_KEY_PATH, 'utf8'),
      cert: fs.readFileSync(this.CA_CERT_PATH, 'utf8')
    }
  }

  async getCertByHost(hostname) {
    return {
      key: fs.readFileSync(this.USER_KEY_PATH, 'utf8'),
      cert: fs.readFileSync(this.USER_CERT_PATH, 'utf8')
    }
  }
  
  isCAExist() {
    return true
  }
}

module.exports = CertBase
