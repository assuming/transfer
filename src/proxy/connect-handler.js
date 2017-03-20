const http = require('http')
const url = require('url')
const net = require('net')
const { logJSON } = require('../utils/logger.js')

const CONNECT_RESPONSE = `HTTP/1.1 200 Connection Established\r\nProxy-agent: Transfer\r\n\r\n`

/**
 * CONNECT request handler
 * 
 * @param  {Stream} req    client request
 * @param  {Stream} socket client socket
 * @param  {String} head   
 */
function connectHandler(req, socket, head) {
  const reqData = connectReqParser(req.url)

  logJSON(reqData)

  const pSocket = net.connect(reqData.port, reqData.hostname, () => {
    socket.write(CONNECT_RESPONSE)
    // do we need head?
    pSocket.write(head)
    pSocket.pipe(socket)
    socket.pipe(pSocket)
  })
}

function connectReqParser(req) {
  const realURL = `https://${req}`
  const reqData = url.parse(realURL)

  return reqData
}

module.exports = connectHandler
