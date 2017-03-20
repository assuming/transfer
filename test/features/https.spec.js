const http = require('http')
const https = require('https')
const tls = require('tls')
const test = require('tape')

/**
 * Test cases
 */

const options = {
  hostname: '127.0.0.1',
  port: 7777,
  path: 'www.baidu.com:443',
  method: 'CONNECT',
  headers: {
    host: 'baidu.com'
  }
}

let body = ''
const req = http.request(options)
req.end()

req.on('connect', (res, socket, head) => {
  console.log('connected')

  const skt = tls.connect({ 
    socket: socket,
    rejectUnauthorized: false
  }, () => {
    skt.write('GET / HTTP/1.1\r\n' +
              'Host: www.baidu.com\r\n' +
              '\r\n')
  })

  skt.on('data', chunk => {
    console.log(body += chunk)
  })
  skt.on('end', () => {
    console.log(body.toString())
  })
})
req.on('error', e => console.log(`request error => ${e}`))
