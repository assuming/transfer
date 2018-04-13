import os from 'os'
import path from 'path'

/**
 * Certification constants
 */

// default subject of transfer
export const TRANSFER_SUBJECT = {
  country: 'CN',
  organization: 'Transfer',
  organizationUnit: 'Transfer Certification Center'
}
export const HTTPS_SERVER_COMMONNAME = 'Transfer HTTPS proxy'

/** 
 * Default options for transfer init
 */

export const DEFAULT_INIT_OPTIONS = {
  port: 7777,
  certsPath: path.join(os.homedir(), '.transfer_certs'),
  caCertName: 'Transfer Proxy CA',
  opensslPath: null,
  // hot options
  httpsWhitelist: [],
  mapRules: [],
  blacklist: [],
}

/**
 * Default intercept collector object
 */

// request status types
export const STATUS_FETCHING = 'Fetching'
export const STATUS_ERROR = 'Error'
export const STATUS_FINISHED = 'Finished'

export const DEFAULT_COLLECTOR_DATA = {
  id: '',
  status: STATUS_FETCHING,
  url: '',
  method: '',
  protocol: '',
  protocolVersion: '',
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
  id: '',
  status: STATUS_FETCHING,
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