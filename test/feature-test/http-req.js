const http = require('http')

const options = {
  hostname: 'ohmyxm.xyz',
  port: 80,
  path: '/',
  method: 'GET'
}

let body = ''
const req = http.request(options, res => {
  console.log(res.statusCode)
  res.on('data', chunk => {
    body += chunk
  })
  res.on('end', () => {
    console.log('Transfer complete:')
    console.log(body)
  })
})

req.on('error', e => console.log(`request error => ${e}`))
req.end()