const util = require('util')
const zlib = require('zlib')
const { randomId, getStreamData } = require('../utils/utils')
const {
  STATUS_ERROR,
  STATUS_FETCHING,
  STATUS_FINISHED,
  DEFAULT_COLLECTOR_DATA
} = require('../constants/configs')

/**
 * Intercept req and res to get information
 */

function createInterceptor(transfer) {
  return async (ctx, next) => {
    // init collector data and assign an id
    ctx.state.collector = {
      ...DEFAULT_COLLECTOR_DATA,
      id: randomId()
    }

    await markRequest(ctx)
    transfer.emit('request', ctx.state.collector)

    await next()

    await markResponse(ctx)
    transfer.emit('response', ctx.state.collector)
  }
}

module.exports = createInterceptor

/**
 * Markers for request data
 * 
 * request field contains
 * - raw     : raw http message, body part is converted to utf-8 string
 * - headers : headers from ctx.req
 * - body    : buffer data for body
 */

async function markRequest(ctx) {
  const bodyBuffer = await getStreamData(ctx.req)
  // mount body to ctx for request sending
  ctx.request.body = bodyBuffer

  const data = {
    url: ctx.url,
    method: ctx.method,
    protocol: ctx.protocol,
    protocolVersion: ctx.req.httpVersion,
    request: {
      raw: getRawRequest(ctx),
      headers: ctx.headers,
      body: bodyBuffer
    }
  }

  ctx.state.collector = { ...ctx.state.collector, ...data }
}

function getRawRequest(ctx) {
  const headerContent = Object.keys(ctx.headers).map(h => {
    return `${h}:${ctx.headers[h]}`
  }).join('\n') + '\n'
  const startLine = `${ctx.method} ${ctx.path} HTTP/${ctx.req.httpVersion}\n`
  const rawBody = ctx.request.body.toString()

  return startLine + headerContent + rawBody
}

/**
 * Markers for response data
 * 
 * request field contains
 * - raw     : raw http message, body part is converted to utf-8 string
 *             Note that here the body stays unchanged (i.e. if the body
 *             is gzipped by the server, we don't decompress it)
 * - headers : headers from ctx.response
 * - body    : buffer data for body. This body data is always decompressed
 *             Even though we removed the 'Accept-Encoding' header before
 *             sending the request, some servers might ignore that header 
 *             and send compressed data back anyway. Here we double check
 */

async function markResponse(ctx) {
  // make sure response.body field get non-compress data
  let finalBody = ctx.body
  const resEncoding = ctx.response.headers['content-encoding']

  // there're still some other compress algorithms but
  // seems like no one use them
  if (resEncoding === 'gzip') {
    const gunzip = util.promisify(zlib.gunzip)
    finalBody = await gunzip(ctx.body)
  } else if (resEncoding === 'deflate') {
    const inflate = util.promisify(zlib.inflate)
    finalBody = await inflate(ctx.body)
  }

  const data = {
    status: STATUS_FINISHED,
    statusCode: ctx.status,
    statusMessage: ctx.message,
    timings: calcTime(ctx.state.timings),
    response: {
      raw: await getRawResponse(ctx),
      headers: ctx.response.headers,
      body: finalBody
    }
  }

  ctx.state.collector = { ...ctx.state.collector, ...data }
}

function getRawResponse(ctx) {
  const headerContent = Object.keys(ctx.response.headers).map(h => {
    return `${h}:${ctx.response.headers[h]}`
  }).join('\n') + '\n'
  const startLine = `HTTP/${ctx.req.httpVersion}\n ${ctx.status} ${ctx.message}\n`
  const rawBody = ctx.body.toString()

  return startLine + headerContent + rawBody
}

/**
 * Make timings object
 * 
 * startTime 
 * start -> socket -> lookup -> connect -> response -> end
 * endTime
 */

function calcTime(timings) {
  return {
    startTime: timings.startTime,
    wait: timings.socket - timings.start,
    dns: timings.lookup - timings.socket,
    tcp: timings.connect - timings.lookup,
    firstByte: timings.response - timings.connect,
    download: timings.end - timings.response,
    endTime: timings.endTime
  }
}