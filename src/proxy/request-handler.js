const http = require('http')
const https = require('https')
const url = require('url')
const { 
  requestInterceptor,
  responseInterceptor
} = require('../interceptors/interceptor.js')
const { 
  httpsCheck, 
  assembleURL, 
  randomId, 
  isMapped 
} = require('../utils/utils.js')
const { logJSON, logKeys } = require('../utils/logger.js')

/**
 * Constants
 */

const localhost = '127.0.0.1'


/**
 * Request handler creator
 * 
 * @param  {Function} interceptor callback to retrieve data when events fired
 * @param  {Object}   mapServer   an instance of MapServer
 * @return {Function}             request handler function
 */
function makeRequestHandler(interceptor, mapPort, mapRules) {
  const itr = new Interceptor(interceptor)

  return (req, res) => {
    // generate id for this session
    const transferId = randomId()
    itr.req(req, transferId)

    const { protocol, options } = parseOptions(req, mapRules, mapPort)

    const pReq = protocol.request(options, pRes => {
      itr.res(pRes, transferId)

      res.writeHead(pRes.statusCode, pRes.headers)
      pRes.pipe(res)
    }).on('error', e => {
      throw e
    })

    req.pipe(pReq)
  }
}

/**
 * Make request options from client's incoming request
 */

function parseOptions(req, mapRules, mapPort) {
  const isHttps = httpsCheck(req.url)
  const protocol = isHttps ? https : http
  const defaultPort = isHttps ? 443 : 80

  let options = {}
  let reqData = {}

  // https req is using CONNECT, should assemble path and host manually
  if (!isHttps) {
    reqData = url.parse(req.url)
  } else {
    const _url = assembleURL(req.headers.host, req.url)
    reqData = url.parse(_url)
  }

  if (isMapped(fixSlash(reqData.href), mapRules)) {
    options = {
      host: localhost,
      port: mapPort,
      path: req.href,
      method: 'GET',
      headers: req.headers
    }
  } else {
    options = {
      host: reqData.hostname,
      port: reqData.port || defaultPort,
      path: reqData.path,
      method: req.method,
      headers: req.headers
    }
  }

  logJSON(options)

  return options
}

module.exports = makeRequestHandler
