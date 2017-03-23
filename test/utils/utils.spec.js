const test = require('tape')
const utils = require('../../build/utils/utils.js')

/**
 * Test cases
 */

// test('checkOptions', function(t) {

// })

test('isInList', function(t) {
  t.plan(4)

  const list = [
    'google.com', 
    'apple.com',
    'pineapple.com',
    'api.github.com'
  ]

  const hostA = 'google.com'        // true
  const hostB = 'api.apple.com'     // false
  const hostC = 'github.com'        // false
  const hostD = 'api.fxxkapple.com' // false

  t.equal(utils.isInList(hostA, list), true)
  t.equal(utils.isInList(hostB, list), false)
  t.equal(utils.isInList(hostC, list), false)
  t.equal(utils.isInList(hostD, list), false)
})