const http = require('http')
const url = require('url')
const net = require('net')
const now = require("performance-now")
const { isInList, randomId } = require('../utils/utils.js')
const { 
  STATUS_FETCHING,
  STATUS_ERROR,
  STATUS_FINISHED,
  DEFAULT_CONNECT_DATA 
} = require('../constants/configs')

/**
 * Constants
 */

const CONNECT_RESPONSE = `HTTP/1.1 200 Connection Established\r\nProxy-agent: Transfer\r\n\r\n`
const localhost = '127.0.0.1'

/**
 * Connect event handler creator
 * 
 * @param  {Number}   port           https server port
 * @param  {Array}    httpsWhitelist domains list that needs to be intercepted
 * @param  {Object}   transfer       transfer instance to fire events
 * @return {Function} connect handler function
 */

function createConnectHandler(port, httpsWhitelist, transfer) {
  return (req, socket, head) => {
    const reqData = url.parse(`https://${req.url}`)

    if (httpsWhitelist === '*') {
      // * -> intercept all https traffic
      const pSocket = connect(port, localhost, socket, head)
    } else {
      if (isInList(reqData.hostname, httpsWhitelist)) {
        // connect local https server to intercept
        connect(port, localhost, socket, head)
      } else {
        // do the same in interceptor
        let startTime = new Date().getTime()
        let start = now()

        let collector = {
          ...DEFAULT_CONNECT_DATA,
          id: randomId(),
          url: req.url,
          protocolVersion: `HTTP/${req.httpVersion}`
        }
        transfer.emit('request', collector)

        const pSocket = connect(reqData.port, reqData.hostname, socket, head)
        pSocket
          .on('end', () => {
            collector = {
              ...collector,
              status: STATUS_FINISHED,
              timings: {
                startTime: startTime,
                total: now() - start,
                endTime: new Date().getTime()
              }
            }

            transfer.emit('response', collector)
          })
          .on('error', e => {
            collector.status = STATUS_ERROR
            collector.timings.startTime = startTime
            transfer.emit('response', collector)
          })
      }
    }
  }
}

module.exports = createConnectHandler

/**
 * Make tcp connection
 */

function connect(port, hostname, socket, head) {
  const pSocket = net.connect(port, hostname, () => {
    socket.write(CONNECT_RESPONSE)
    pSocket.write(head)

    pSocket.pipe(socket)
    socket.pipe(pSocket)
  })

  return pSocket
}