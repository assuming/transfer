const http = require('http')
const https = require('https')
const url = require('url')
const util = require('util')
const zlib = require('zlib')
const now = require("performance-now")
const cleanHeaders = require('../utils/header-check/check')
const { 
  httpsCheck, 
  assembleURL, 
  rq,
  getStreamData
} = require('../utils/utils')
const { STATUS_ERROR } = require('../constants/configs')

/**
 * Request sending middleware creator
 */

function createSender(transfer) {
  return async (ctx, next) => {
    const collector = ctx.state.collector
    const options = parseRequest(ctx.request)

    // get timings name for convenient
    const timings = ctx.state.timings
    
    // send request and set response headers and status code
    // return response body buffer data
    const bodyBuffer = await new Promise((resolve, reject) => {
      // request start
      timings.startTime = new Date().getTime()
      timings.start = now()

      const proxyReq = rq(options)

      // when a socket is assigned
      proxyReq.on('socket', socket => {
        timings.socket = now()
        const isReuse = !socket.connecting

        // if not from a reused socket
        if (!isReuse) {
          const onLookup = () => timings.lookup = now()
          const onConnect = () => timings.connect = now()

          socket.once('lookup', onLookup)
          socket.once('connect', onConnect)

          // when error occurs remove the socket level handler
          // cause maybe the socket is reused?
          // 
          // According to request lib:
          // https://github.com/request/request/blob/master/request.js#L797
          proxyReq.once('error', () => {
            socket.removeListener('lookup', onLookup)
            socket.removeListener('connect', onConnect)
          })
        }
      })

      // when response's first byte arrived
      proxyReq.on('response', proxyRes => {
        timings.response = now()

        getStreamData(proxyRes).then(bodyBuffer => {
          // request end, I know it's a little bit late
          timings.end = now()
          timings.endTime = new Date().getTime()

          // set status and headers for convenience
          ctx.status = proxyRes.statusCode
          ctx.set(cleanHeaders(proxyRes.headers))

          resolve(bodyBuffer)
        })
      })

      // if the connection broke, finished the collector
      proxyReq.on('error', err => {
        collector.status = STATUS_ERROR
        transfer.emit('response', collector)

        reject(err)
      })

      // send request body (if POST method)
      proxyReq.end(ctx.request.body)
    })

    ctx.body = bodyBuffer
  }
}

module.exports = createSender

/**
 * Make options from in-coming request
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
    url: realUrl,
    method: request.method,
    headers: request.headers
  }

  // since it's a debugging proxy, no need for gzip stuff.
  // Unzip and zip the response will cost a lot time on the
  // local machine
  delete options.headers['accept-encoding']

  return options
}
