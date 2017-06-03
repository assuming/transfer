const path = require('path')
const { getHomePath } = require('../utils/utils.js')

/**
 * Default options for transfer init
 *
 * httpPort           : port for http server
 * httpsPort          : port for https intercepting server    
 * httpsWhiteList     : list for https domains that need to be intercepted
 *                      []  -> no HTTPS traffic will be decryted
 *                      '*' -> all HTTPS traffic will be decrypted
 * mapRules           : object of map pattern
 * blacklist          : list of domain names to be blocked
 */
exports.DEFAULT_INIT_OPTIONS = {
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhiteList: [],
  mapRules: {},
  blacklist: []
}

/**
 * Certification constants
 */

// where to store certs
exports.CERTBASE_PATH = path.join(getHomePath(), '.transfer_certs')
exports.CERTBASE_PATH_TEST = path.join(__dirname, '../../certs')

// default subject of transfer
exports.TRANSFER_SUBJECT = {
  country: 'CN',
  organization: 'Transfer',
  organizationUnit: 'Transfer Certification Center'
}
exports.CA_CERT_COMMONNAME = 'Transfer Proxy CA'
exports.HTTPS_SERVER_COMMONNAME = 'Transfer HTTPS proxy'
