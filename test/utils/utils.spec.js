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

test('getMapped', async t => {
  const fileMatchGroup = {
    rule: 'https://github.com/assets/main.css',
    target: 'http://google.com/assets/main.css',
    urls: {
      'https://github.com/assets/main.css': 'http://google.com/assets/main.css',
      'https://github.com/assets/old/main.css': false,
      'https://github.com/assets/main.min.css': false
    }
  }
  const dirMatchGroup = {
    rule: 'https://github.com/assets/*',
    target: '/User/fake/folder/*',
    urls: {
      'https://github.com/assets/main.css': '/User/fake/folder/main.css',
      'https://github.com/assets/js/index.js': '/User/fake/folder/js/index.js',
      'https://github.com/index.html': false
    }
  }

  function run(testGroup, t) {
    const urls = testGroup.urls
    const ruleObj = {
      rule: testGroup.rule,
      target: testGroup.target
    }

    Object.keys(urls).forEach(urlString => {
      const result = utils.getMapped(urlString, ruleObj)
      t.is(result, urls[urlString])
    })
  }
  
  t.test('Full Match', async t => run(fileMatchGroup, t))
  t.test('Directory Match', async t => run(dirMatchGroup, t))
})

test('isBlack', async t => {
  const fullMatchGroup = {
    rule: 'https://github.com/index.html',
    urls: {
      'https://github.com/index.html': true,
      'http://github.com/index.html': false,
      'https://github.com/': false
    }
  }

  const dirMatchGroup = {
    rule: 'https://github.com/assets/*',
    urls: {
      'https://github.com/assets/index.css': true,
      'https://github.com/assets/css/index.css': true,
      'https://github.com/assets/': true,
      'http://github.com/asset/index.css': false,
      'https://github.com/assets': false,
    }
  }
  
  function run(group, t) {
    const rule = group.rule
    const urls = group.urls

    Object.keys(urls).forEach(url => {
      t.is(utils.isBlack(url, rule), urls[url])
    })
  }

  t.test('Full Match', async t => run(fullMatchGroup, t))
  t.test('Dir Match', async t => run(dirMatchGroup, t))
})

test('checkTarget', async t => {
  t.is(utils.checkTarget('https://github.com'), true)
  t.is(utils.checkTarget('/User/name'), false)
})

test('capitalKebab', async t => {
  t.is(utils.capitalKebab('content-type'), 'Content-Type')
  t.is(utils.capitalKebab('connection'), 'Connection')
  t.is(utils.capitalKebab('x'), 'X')
  t.is(utils.capitalKebab('x-k-s-d'), 'X-K-S-D')
})

test('parseQueries', async t => {
  const urlString = 'http://github.com/api?_t=111&year=2017'
  t.is(utils.parseQueries(urlString)._t, '111')
})