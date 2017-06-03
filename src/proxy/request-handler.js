const http = require('http')
const https = require('https')
const url = require('url')
const { 
  httpsCheck, 
  assembleURL, 
  randomId,
  fixSlash
} = require('../utils/utils.js')


/**
 * Request handler creator
 * 
 * @param {Interceptor} interceptor 
 * @param {Function}    function to map request destination
 * @returns 
 */
function makeRequestHandler(interceptor, mapFilter) {
  return (req, res) => {
    const transferId = randomId()
    interceptor.install(req, res, transferId)

    // trun req into options and choose a protocol
    const { protocol, options } = parseOptions(req, mapFilter)

    const pReq = protocol.request(options, pRes => {
      // interceptor.res(pRes, transferId)

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

function parseOptions(req, mapFilter) {
  const isHttps = httpsCheck(req.url)

  // https req is using CONNECT, should assemble path and host manually
  let reqData = {}
  if (!isHttps) {
    reqData = url.parse(req.url)
  } else {
    const _url = assembleURL(req.headers.host, req.url)
    reqData = url.parse(_url)
  }

  // init the field except the url info part, give that to mapFilter
  let options = {
    method: req.method,
    headers: req.headers
  }

  return mapFilter(fixSlash(reqData.href), options)
}

module.exports = makeRequestHandler
