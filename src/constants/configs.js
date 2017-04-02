const path = require('path')
const { getHomePath } = require('../utils/utils.js')

/**
 * Default options
 *
 * httpPort           : port for http server
 * httpsPort          : port for https intercepting server    
 * httpsWhiteList     : list for https domains that need to be intercepted
 * interceptors       : interceptors
 * allHttpsDecryption : if true, intercept all https traffic, httpsWhiteList will be ignored
 */
exports.defaultOptions = {
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhiteList: [],
  interceptors: null,
  allHttpsDecryption: false
}

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
