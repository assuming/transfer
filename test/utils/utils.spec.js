const test = require('tape')
const utils = require('../../src/utils/utils.js')

/**
 * Test cases
 */

// test('checkOptions', function(t) {

// })

test('isInList', function(t) {
  const list = [
    'google.com', 
    'api.google.com',
    'apple.com',
    'pineapple.com.cn',
    'api.github.com',
    'what.the.fxxk.did.you.do.xyz'
  ]

  const hostA = 'google.com'    // true
  const hostB = 'api.apple.com' // true
  const hostC = 'github.com'    // false

  utils.isInList()

})