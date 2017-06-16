const http = require('http')
const rq = require('request')
const url = require('url')
const zlib = require('zlib')
const util = require('util')
const { stopServer } = require('../build/utils/utils')


const server = http.createServer().listen(9999)

setTimeout(function() {
  stopServer(server).then(console.log('stoped'))
}, 1000);