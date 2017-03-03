const http = require('http')
const should = require('should')
const Transfer = require('../../src/index.js')

const proxy = new Transfer({
  port: 7777
})
proxy.start()


// describe('HTTP proxy', function() {
//   describe('', function() {
//     it('should')
//   })
// })
