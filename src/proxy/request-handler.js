const http = require('http')
const https = require('https')
const url = require('url')
const { logJSON, logKeys } = require('../utils/logger.js')
const { httpsCheck, assembleURL } = require('../utils/utils.js')

function makeRequestHandler(interceptors) {  
  return (req, res) => {
    const isHttps = httpsCheck(req.url)
    const options = getOptionsFromReq(req, isHttps)
    const protocol = isHttps ? https : http

    const pReq = protocol.request(options, pRes => {
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

function getOptionsFromReq(req, isHttps) {
  const defaultPort = isHttps ? 443 : 80

  let options = {}, reqData = {}
  if (!isHttps) {
    reqData = url.parse(req.url)
  } else {
    const _url = assembleURL(req.headers.host, req.url)
    reqData = url.parse(_url)
  }

  options = {
    host: reqData.hostname,
    port: reqData.port || defaultPort,
    path: reqData.path,
    method: req.method,
    headers: req.headers
  }

  logJSON(options)

  return options
}

module.exports = makeRequestHandler
