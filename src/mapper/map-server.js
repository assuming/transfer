const createMapRequestHandler = require('./map-request-handler.js')


class MapServer {
  constructor(mapRules) {
    this.server = http.createServer()
    this.mapRules = mapRules
  }

  start() {
    this.server
      .on('request', requestHandler)
      .listen()
    this.port = this.server.address().port

    return {
      host: '0.0.0.0',
      port: this.port
    }
  }
}

module.exports = MapServer
