const http = require('http')

const server = http.createServer()
server.listen(8000)

server.on('request', () => {
  console.log('yeah')
})



  