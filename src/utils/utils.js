const url = require('url')
const tls = require('tls')
const path = require('path')
const crypto = require('crypto')
const urljoin = require('url-join')

/**
 * Check Transfer init options for safety
 */

exports.checkOptions = function(options) {
  const result = { ...options }
  const {
    httpPort,
    httpsPort
  } = options

  // if only one port provided, use default ports
  // user must provide 2 ports
  if ((httpPort && !httpsPort) || (!httpPort && httpsPort)) {
    delete result.httpPort
    delete result.httpsPort
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
 * If an url matches the rule, return the final url or return false
 */

exports.findMappedPath = function(urlString, ruleObj) {
  const rule = ruleObj.rule
  const target = ruleObj.target
  let result = false

  const ruleLastChar = rule[rule.length - 1]

  if (urlString === rule) {
    /**
     * Full match
     * 
     * `urlString` is the same as `rule`, just return the target url
     */

     result = target
  } else if (ruleLastChar === '*') {
    /**
     * Dir match
     * 
     * Map requests to a directory(remote or local is both ok)
     * 
     * urlString : https://github.com/api/|nav.css
     *                    [prefix]        [suffix]
     * rule      : https://github.com/api/|*
     * target    : https://github.com/api/old/|*
     *                 [targetPrefix]
     */

    const prefix = rule.split('*')[0]
    if (urlString.indexOf(prefix) !== -1) {
      const suffix = urlString.split(prefix)[1]
      const targetPrefix = target.split('*')[0]

      result = urljoin(targetPrefix, suffix)
    }
  } else if (rule.indexOf('*') !== -1) {
    /**
     * Part match
     * 
     * urlString : https://github.com/assets／old/navbar.min.css -> ❌
     *             https://github.com/assets/navbar.css -> ❌
     *             https://github.com/assets/navbar.test.min.css -> ✅
     * 
     * rule      : https://github.com/assets/|*|.min.css
     *                  [ruleLocation]         [fileExt]
     * target    : https://github.com/assets/*
     * 
     */

    let [ruleLocation, fileExt] = rule.split('*')

    const urlArray = urlString.split('/')
    const filename = urlArray.pop()
    const location = urlString.split(filename)[0]

    if (location === ruleLocation) {
      // convert string to excape special chars
      const _fileExt = fileExt.split('.').join('\\.')
      const reg = new RegExp(`.+${_fileExt}`)

      if (reg.test(filename)) {
        result = urljoin(target.split('*')[0], filename)
      }
    }
  }

  return result
}