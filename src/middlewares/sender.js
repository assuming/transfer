import http from 'http'
import https from 'https'
import url from 'url'
import util from 'util'
import now from "performance-now"
import cleanHeaders from '../utils/header-check/check'
import { 
  httpsCheck, 
  assembleURL, 
  rq,
  getStreamData
} from '../utils/utils'
import { STATUS_ERROR } from '../constants/configs'

/**
 * Request sending middleware creator
 */

export default function createSender(transfer) {
  return async (ctx, next) => {
    const collector = ctx.state.collector
    const timings = ctx.state.timings

    const options = parseRequest(ctx.request)
    
    // send request and set response headers & status code
    // return response body buffer data
    const bodyBuffer = await new Promise((resolve, reject) => {
      // request start
      timings.startTime = new Date().getTime()
      timings.start = now()

      const proxyReq = rq(options)
        // when a socket is assigned, record the time
        .on('socket', socket => {
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
        .on('response', proxyRes => {
          timings.response = now()

          getStreamData(proxyRes).then(buff => {
            // request end, I know it's a little bit late
            timings.end = now()
            timings.endTime = new Date().getTime()

            // have to set status and headers
            ctx.status = proxyRes.statusCode
            ctx.set(cleanHeaders(proxyRes.headers))

            resolve(buff)
          })
        })
        // if the connection broke, finished the collector
        .on('error', err => {
          collector.status = STATUS_ERROR
          collector.timings = {
            ...collector.timings,
            startTime: timings.startTime
          }
          transfer.emit('response', collector)

          reject(err)
        })

      // send request body (if POST method)
      proxyReq.end(ctx.request.body)
    })

    ctx.body = bodyBuffer
  }
}

/**
 * Make options from in-coming request
 */

function parseRequest(request) {
  const options = {
    url: request.url,
    method: request.method,
    headers: request.headers
  }

  // since it's a debugging proxy, no need for gzip stuff.
  // Unzip and zip the response will cost a lot time on the
  // local machine
  delete options.headers['accept-encoding']

  return options
}
