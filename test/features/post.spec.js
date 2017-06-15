const request = require('request')

request({
  url: 'http://jsonplaceholder.typicode.com/posts',
  method: 'POST',
  json: true,
  body: {
    title: 'xxxx',
    body: 'yyyy yyyy yyyy yyyy',
    userId: 1
  },
  proxy: 'http://localhost:7777'
}, (err, res, body) => {
  console.log(body)
})