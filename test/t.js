const http = require('http')
const rq = require('request')
const url = require('url')
const zlib = require('zlib')
const util = require('util')

const buffer = new Buffer('lorem ipsum dolor sit amet', 'utf8')

// zlib.gzip(buffer, (err, data) => {
//   console.log(data.toString())
// })

const gzip = util.promisify(zlib.gzip)

gzip(buffer).then(data => console.log(data.toString()))


// const proxy = http.createServer()
//   .on('request', (req, res) => {
//     // const pReq = rq(req.url, (err, pRes, body) => {
//     //   res.writeHead(pRes.statusCode, pRes.headers)
//     //   pRes.pipe(res)
//     // })

//     const pReq = rq(req.url)
//       .on('response', pRes => {
//         // pRes.headers.eee = 'eee'
//         res.writeHead(pRes.statusCode, pRes.headers)
//         pRes.pipe(res)
//       })


//     // const u = url.parse(req.url)
//     // const pReq = http.request({
//     //   hostname: u.hostname,
//     //   port: u.port || 80,
//     //   path: u.path,
//     //   method: req.method,
//     //   headers: req.headers
//     // }, pRes => {
//     //   res.writeHead(pRes.statusCode, pRes.headers);
//     //   pRes.pipe(res)
//     // })

//     req.pipe(pReq)
//   })
//   .listen(7777)