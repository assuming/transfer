const http = require('http')

const server = http.createServer()

server
  .on('request', rh)
  .listen(8000)

function rh(req, res) {
  
}