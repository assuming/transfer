const Transfer = require('../src/index.js')

const proxy = new Transfer({
  port: 7777
})

proxy.start()