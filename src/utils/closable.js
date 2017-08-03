/**
 * Decorator for node's server. Enhance the close method
 * 
 * Make the close method shutdown the server immediately 
 * regardless of the existence of active socket connections 
 * or keep alive connections
 */

function closable(server) {
  const sockets = new Map()
  const nativeClose = server.close
  // replace the native close method with our custom one
  server.close = forceClose

  server.on('connection', socket => {
    // record the socket
    sockets.set(socket, socket)
    // delete it when it closes
    socket.on('close', () => sockets.delete(socket))
  })

  function forceClose(cb) {
    // destroy every socket including idle & active
    sockets.forEach(socket => socket.destroy())
    // call the native close method of server
    server.close(cb)
  }

  return server
}

module.exports = closable