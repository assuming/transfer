const path = require('path')
const { getHomePath } = require('../utils/utils.js')

/**
 * Default options for transfer init
 *
 * - httpPort       : port for http server
 * - httpsPort      : port for https intercepting server    
 * - httpsWhiteList : list for https domains that need to be intercepted
 *                    []  -> no HTTPS traffic will be decryted
 *                    '*' -> all HTTPS traffic will be decrypted
 * - mapRules       : object of map pattern
 * - blacklist      : list of url rules
 * - certsPath      : where to store certs
 */

exports.DEFAULT_INIT_OPTIONS = {
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhiteList: [],
  mapRules: {},
  blacklist: [],
  certsPath: path.join(getHomePath(), '.transfer_certs')
}

/**
 * Certification constants
 */

// where to store certs
exports.CERTBASE_PATH = path.join(getHomePath(), '.transfer_certs')

// default subject of transfer
exports.TRANSFER_SUBJECT = {
  country: 'CN',
  organization: 'Transfer',
  organizationUnit: 'Transfer Certification Center'
}
exports.CA_CERT_COMMONNAME = 'Transfer Proxy CA'
exports.HTTPS_SERVER_COMMONNAME = 'Transfer HTTPS proxy'

/**
 * Default intercept collector object
 */

// request status types
exports.STATUS_FETCHING = 'Fetching'
exports.STATUS_ERROR = 'Error'
exports.STATUS_FINISHED = 'Finished'

exports.DEFAULT_COLLECTOR_DATA = {
  crypted: false,
  id: '',
  status: 'Fetching',
  url: '',
  method: '',
  protocol: '',
  request: {
    raw: '',
    headers: {},
    body: ''
  },

  // other middleware will modify this
  map: {
   mapType: '',
   mappedUrl: ''
  },
  blocked: false,

  // when response arrive
  statusCode: '',
  statusMessage: '',
  timings: {
    startTime: 0,
    wait: 0,
    dns: 0,
    tcp: 0,
    firstByte: 0,
    download: 0,
    total: 0,
    endTime: 0
  },
  response: {
    raw: '',
    headers: {},
    body: ''
  }
}

exports.DEFAULT_CONNECT_DATA = {
  crypted: true,
  id: '',
  status: 'Fetching',
  method: 'CONNECT',
  url: '',
  protocol: 'https',
  protocolVersion: '',

  // when data transmitted
  timings: {
    startTime: 0,
    total: 0,
    endTime: 0
  }
}

exports.DEFAULT_TIMINGS = {
  startTime: 0,
  start: 0,
  socket: 0,
  lookup: 0,
  connect: 0,
  response: 0,
  end: 0,
  endTime: 0
}