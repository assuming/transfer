import path from 'path'
import { getHomePath } from '../utils/utils.js'

/**
 * Default options for transfer init
 *
 * - port           : port for server
 * - httpsWhitelist : list for https domains that need to be decrypted
 *                    []  -> no HTTPS traffic will be decryted
 *                    '*' -> all HTTPS traffic will be decrypted
 * - mapRules       : object of map pattern
 * - blacklist      : list of url rules
 * - certsPath      : where to store certs
 */

export const DEFAULT_INIT_OPTIONS = {
  port: 7777,
  httpsWhitelist: [],
  mapRules: {},
  blacklist: [],
  certsPath: path.join(getHomePath(), '.transfer_certs'),
  caCertName: 'Transfer Proxy CA'
}

/**
 * Certification constants
 */

// where to store certs
export const CERTBASE_PATH = path.join(getHomePath(), '.transfer_certs')

// default subject of transfer
export const TRANSFER_SUBJECT = {
  country: 'CN',
  organization: 'Transfer',
  organizationUnit: 'Transfer Certification Center'
}
export const HTTPS_SERVER_COMMONNAME = 'Transfer HTTPS proxy'

/**
 * Default intercept collector object
 */

// request status types
export const STATUS_FETCHING = 'Fetching'
export const STATUS_ERROR = 'Error'
export const STATUS_FINISHED = 'Finished'

export const DEFAULT_COLLECTOR_DATA = {
  crypted: false,
  id: '',
  status: 'Fetching',
  url: '',
  method: '',
  protocol: '',
  request: {
    raw: '',
    headers: {},
    cookies: {},
    queries: {},
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
    cookies: {},
    body: ''
  }
}

export const DEFAULT_CONNECT_DATA = {
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

export const DEFAULT_TIMINGS = {
  startTime: 0,
  start: 0,
  socket: 0,
  lookup: 0,
  connect: 0,
  response: 0,
  end: 0,
  endTime: 0
}