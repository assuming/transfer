
function requestPrinter(socket) {
  let rawRequest = '';
  // socket.on('data', chunk => rawRequest += chunk)
  socket.on('data', chunk => console.log(chunk.toString()));
  // socket.on('end', () => console.log(rawRequest))
}

module.exports = requestPrinter;