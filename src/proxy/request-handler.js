const http = require('http')
const url = require('url')
const { logJSON, logKeys } = require('../utils/logger.js')
const { httpsCheck, assembleURL } = require('../utils/utils.js')

function makeRequestHandler(interceptors) {  
  return (req, res) => {
    const options = getOptionsFromReq(req)

    const pReq = http.request(options, pRes => {
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

function getOptionsFromReq(req) {
  const isHttps = httpsCheck(req.url)
  const defaultPort = isHttps ? 443 : 80

  let options = {}, reqData = {}
  if (!isHttps) {
    reqData = url.parse(req.url)
  } else {
    const _url = assembleURL(req.headers.host, req.url)
    reqData = url.parse(req.url)
  }

  options = {
    host: reqData.hostname,
    port: reqData.port || defaultPort,
    path: reqData.path,
    method: req.method,
    headers: req.headers
  }

  return options
}

module.exports = makeRequestHandler
