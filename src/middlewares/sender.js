const http = require('http')
const https = require('https')
const url = require('url')
const rq = require('request')
const { 
  httpsCheck, 
  assembleURL 
} = require('../utils/utils')
const { printReq } = require('../utils/logger')

/**
 * Request sending middleware creator
 * 
 * @returns koa middleware async function
 */

function createSender() {
  return async (ctx, next) => {
    const options = parseRequest(ctx.request)

    printReq(options)

    await new Promise((resolve, reject) => {
      const proxyReq = rq(options, (err, pRes, body) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })

      // req -> proxy req => server => proxy res -> res
      ctx.req.pipe(proxyReq).pipe(ctx.res)
    })
  }
}

module.exports = createSender

/**
 * Make options from in-coming request
 * 
 * @param   {Object} request 
 * @returns {Object} options for request method
 */

function parseRequest(request) {
  // check if https
  const isHttps = httpsCheck(request.url)

  // if HTTPS then assemble url
  let realUrl = request.url
  if (isHttps) {
    realUrl = assembleURL(request.headers.host, request.url)
  }

  const options = {
    url: url.parse(realUrl),
    method: request.method,
    headers: request.headers
  }

  return options
}
