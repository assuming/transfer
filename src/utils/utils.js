const url = require('url')
const tls = require('tls')
const path = require('path')
const crypto = require('crypto')

/**
 * Check Transfer init options for safety
 */

exports.checkOptions = function(options) {
  const result = { 
    ...options 
  }
  const {
    httpPort,
    httpsPort,
    httpsWhiteList,
    allHttpsDecryption
  } = options

  // if only one port provided, use default ports
  // user must provide 2 ports
  if ((httpPort && !httpsPort) || (!httpPort && httpsPort)) {
    delete result.httpPort
    delete result.httpsPort
  }
  
  // if all https intercept, no need for white list
  if (result.allHttpsDecryption) {
    delete result.httpsWhiteList
  }

  return options
}

/**
 * Check req type, return true if https
 */

exports.httpsCheck = function(urlString) {
  const result = urlString.indexOf('http://') < 0 ? true : false
  return result
}

/**
 * Assemble URL using given host header and path (https server)
 */

exports.assembleURL = function(host, _path) {
  const _url = `https://${path.join(host, _path)}`
  return _url
}

/**
 * Create random id for each session
 */

exports.randomId = function() {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Make path for '~/'
 */

exports.getHomePath = function() {
  // TODO: maybe I can get Windows support, but I'm lazy
  return process.env.HOME
}

/**
 * Check if a given host matches any domain in the whitelist
 */

exports.isInList = function(hostname, list) {
  for (let domain of list) {
    const regString = domain.split('.').join('\\.')
    // e.g. /\.github\.com$/gi
    const reg = new RegExp(`\\.${regString}$`, "gi")

    // same string
    if (hostname === domain) return true
    // not same string, but matches
    if (reg.test(hostname)) return true
  }

  return false
}

/**
 * Change http://a.com/v/ to http://a.com/v/index.html
 */

exports.fixSlash = function(urlString) {
  let fixedUrl = urlString

  const lastChar = urlString[urlString.length - 1]
  if (lastChar === '/') {
    fixedUrl += 'index.html'
  }

  return fixedUrl
}

/** 
 * Check if an url is in mapRules and needs to be mapped to local
 */

exports.isMapped = function(urlString, mapRules) {
  for (let ruleUrl of Object.keys(mapRules)) {
    if (testMatch(urlString, ruleUrl)) {
      return true
    }
  }

  return false
}

/**
 * Get mapped local file or directory path from an url
 */

exports.getMappedPath = function(urlString, mapRules) {
  let mappedPath = ''

  for (let ruleUrl of Object.keys(mapRules)) {
    const result = testMatch(urlString, ruleUrl)

    if (result) {
      if (result.type === 'file') {
        mappedPath = mapRules[ruleUrl]
      } else {
        mappedPath = path.join(mapRules[ruleUrl], result.path)
      }
    }
  }

  return mappedPath
}

/**
 * If an url matches the rule, return the extracted path or return false
 */

function testMatch(urlString, rule) {
  // match type
  const FILE = 'file'
  const DIR = 'directory'
  const DIR_PATTERN = 'directory_pattern'

  let result = {
    type: FILE,
    path: ''
  }

  // check if file mapping
  if (urlString === rule) {
    return result
  }

  const lastChar = rule[rule.length - 1]

  // check if dir mapping
  if (lastChar === '*') {
    const prefix = rule.split('*')[0]

    if (urlString.indexOf(prefix) !== -1) {
      const _path = urlString.split(prefix)[1]

      result.path = _path
      result.type = DIR

      return result
    }
  }

  /**
   * Exist but not the last char, check if dir pattern mapping
   * 
   * given url: http://github.com/api/v3/|gettime.min.css -> ❌
   *                 [urlPrefix]         [filename]
   * given url: http://github.com/api/|gettime.what.ever.name.min.css -> ✅
   *                 [urlPrefix]         [filename]
   * rule     : http://github.com/api/|*|.min.css
   *                  [prefix]           [suffix]
   *
   * First compare urlPrefix, make sure they are the same
   * Then match the filename pattern
   * 
   */
  if (rule.indexOf('*') !== -1) {
    let [prefix, suffix] = rule.split('*')
    // escape dot
    suffix = suffix.split('.').join('\\.')

    const _urlArray = urlString.split('/')
    const filename = _urlArray.pop()
    const urlPrefix = _urlArray.join('/') + '/'

    // luckily same path, then check file name pattern
    if (prefix === urlPrefix) {
      const reg = new RegExp(`.+${suffix}`)
      // match!
      if (reg.test(filename)) {
        result.type = DIR_PATTERN,
        result.path = filename

        return result
      }
    }
  }

  // not dir not file not dir pattern, no match
  return false
}
