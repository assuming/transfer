const http = require('http')
const url = require('url')
const net = require('net')
const { isInList } = require('../utils/utils.js')

/**
 * Constants
 */

const CONNECT_RESPONSE = `HTTP/1.1 200 Connection Established\r\nProxy-agent: Transfer\r\n\r\n`
const localhost = '127.0.0.1'

/**
 * Connect event handler creator
 * 
 * @param  {Number}   port                https server port
 * @param  {Array}    httpsWhiteList      domains list that needs to be intercepted
 * @return {Function}                     connect handler function
 */
function createConnectHandler(port, httpsWhiteList) {
  return (req, socket, head) => {
    const reqData = url.parse(`https://${req.url}`)

    if (httpsWhiteList === '*') {
      // user wants to decrypt all https traffic
      connect(port, localhost, socket, head)
    } else {
      // if host in white list, connect local
      // else connect directly to the real remote server
      isInList(reqData.hostname, httpsWhiteList) ?
        connect(port, localhost, socket, head) :
        connect(reqData.port, reqData.hostname, socket, head)
    }
  }
}

function connect(port, hostname, socket, head) {
  const pSocket = net.connect(port, hostname, () => {
    socket.write(CONNECT_RESPONSE)
    pSocket.write(head)

    pSocket.pipe(socket)
    socket.pipe(pSocket)
  })

  pSocket.on('error', e => {
    throw e
  })

  return pSocket
}

module.exports = createConnectHandler
