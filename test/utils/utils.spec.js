const path = require('path')
const test = require('blue-tape')
const utils = require('../../build/utils/utils.js')

/**
 * Test cases
 */

test('isInList', async t => {
  const hostA = 'google.com'        // true
  const hostB = 'api.apple.com'     // true
  const hostC = 'github.com'        // false
  const hostD = 'api.fxxkapple.com' // false

  const list = [
    'google.com',
    'apple.com',
    'api.github.com'
  ]

  t.equal(utils.isInList(hostA, list), true)
  t.equal(utils.isInList(hostB, list), true)
  t.equal(utils.isInList(hostC, list), false)
  t.equal(utils.isInList(hostD, list), false)
})

test('httpsCheck', async t => {
  const urlA = 'http://www.google.com'
  const urlB = '/'
  const urlC = '/https'

  t.equal(utils.httpsCheck(urlA), false)
  t.equal(utils.httpsCheck(urlB), true)
  t.equal(utils.httpsCheck(urlC), true)
})

test('fixSlash', async t => {
  const urlA = 'http://github.com/api/'
  const urlB = 'http://github.com/api'

  t.equal(utils.fixSlash(urlA), 'http://github.com/api/index.html')
  t.equal(utils.fixSlash(urlB), 'http://github.com/api')
})

test('isMapped', async t => {
  const testCases = {
    // dir map
    'http://github.com/js/gettime.js': true,
    'http://github.com/js/time.txt': true,
    // dir pattern map
    'http://github.com/assets/my.min.css': true,
    'http://github.com/assets/my.spec.fuck.min.css': true,
    'http://github.com/assets/my.css': false,
    'http://github.com/assets/v3/my.min.css': false,
    // file map
    'http://github.com/images/b.png': true,
    'http://github.com/fonts/b.ttf': false
  }

  const testLocalPath = path.join(__dirname, '../')
  const mapRules = {
    'http://github.com/js/*': testLocalPath,
    'http://github.com/assets/*.min.css': testLocalPath,
    'http://github.com/images/b.png': `${testLocalPath}b.png`
  }

  Object.keys(testCases).forEach(_url => {
    t.equal(utils.isMapped(_url, mapRules), testCases[_url])
  })
})

test('getMappedPath', async t => {
  const testCases = {
    'http://github.com/js/gettime.js': 'path/gettime.js',
    'http://github.com/js/name.txt': 'path/name.txt',
    'http://github.com/assets/my.min.css': 'path/my.min.css',
    'http://github.com/assets/my.spec.fuck.min.css': 'path/my.spec.fuck.min.css',
    'http://github.com/images/b.png': 'path/b.png'
  }

  const testLocalPath = 'path/'
  const mapRules = {
    'http://github.com/js/*': testLocalPath,
    'http://github.com/assets/*.min.css': testLocalPath,
    'http://github.com/images/b.png': `${testLocalPath}b.png`
  }

  Object.keys(testCases).forEach(_url => {
    t.equal(utils.getMappedPath(_url, mapRules), testCases[_url])
  })
})