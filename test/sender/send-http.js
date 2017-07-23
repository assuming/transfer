const http = require('http')
const test = require('tape')

/**
 * Test cases
 */

const options = {
  hostname: '127.0.0.1',
  port: 7777,
  path: 'http://ohmyxm.xyz',
  method: 'GET',
  headers: {
    host: 'ohmyxm.xyz'
  }
}


let body = ''
const req = http.request(options, res => {
  console.log(res.headers)
  res.on('data', chunk => {
    body += chunk
  })
  res.on('end', () => {
    console.log(body)
  })
  res.on('error', e => console.log(`response error => ${e}`))
})

req.on('error', e => console.log(`request error => ${e}`))
req.end()