const url = require('url')
const http = require('http')
const https = require('https')
const querystring = require('querystring')
const tls = require('tls')
const path = require('path')
const crypto = require('crypto')
const matcher = require('matcher')
const urljoin = require('url-join')
const cookie = require('cookie')

/**
 * Promisified server close function
 */

exports.stopServer = function(server) {
  return new Promise((resolve, reject) => {
    server.close(e => {
      if (e) {
        reject(e)
      } else {
        resolve()
      }
    })
  })
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
  // only works on *nix
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
 * Rule match types
 */

const FULL_MATCH = 'FULL_MATCH'
const DIR_MATCH = 'DIR_MATCH'
const PART_MATCH = 'PART_MATCH'
const UNKNOWN_RULE = 'UNKNOWN_RULE'

/**
 * Check if a url matches the rule
 * Yes : returns the mapped url
 * No  : returns false
 * 
 * @param   {String} urlString
 * @param   {Object} ruleObj   contains rule & target fields
 * @returns {String} or false
 */

exports.getMapped = function(urlString, ruleObj) {
  const rule = ruleObj.rule
  const target = ruleObj.target
  let result = false

  const ruleType = getRuleType(ruleObj)

  if (ruleType === UNKNOWN_RULE) {
    // currently we do nothing
  }

  if (ruleType === FULL_MATCH) {
    if (urlString === rule) {
      result = target
    }
  } else if (ruleType === DIR_MATCH) {
    /**
     * Directory match
     * 
     * Map requests to a directory(remote or local is both ok)
     * 
     * urlString : https://github.com/assets/my.css
     * rule      : https://github.com/assets/*
     * target    : https://github.com/old/assets/*
     */

    const r = matcher.isMatch(urlString, rule)
    if (r) {
      const dirPathRule = rule.split('*')[0]
      const fileName = urlString.split(dirPathRule)[1]

      result = urljoin(target.split('*')[0], fileName)
    }
  } else if (ruleType === PART_MATCH) {
    /**
     * Part match
     * 
     * Wildcard filename
     * 
     * urlString : https://github.com/assets/my.css
     * rule      : https://github.com/assets/*.css
     * target    : https://github.com/old/assets/*
     */

    const fileName = urlString.split('/').pop()
    const fileNameRule = rule.split('/').pop()
    const dirPath = urlString.split(fileName)[0]
    const dirPathRule = rule.split(fileNameRule)[0]

    if (dirPath === dirPathRule &&
      matcher.isMatch(fileName, fileNameRule)) {
      result = urljoin(target.split('*')[0], fileName)
    }
  }

  return result
}

function getRuleType(ruleObj) {
  const rule = ruleObj.rule
  const target = ruleObj.target
  let result = UNKNOWN_RULE

  if ((rule + target).indexOf('*') === -1) {
    /**
     * 1. rule & target have no *
     */
    result = FULL_MATCH
  } else {
    const ruleArr = rule.split('/*')
    const targetArr = target.split('/*')

    if (ruleArr.length === 2 &&
        targetArr.length === 2 &&
        ruleArr[1] === '' &&
        targetArr[1] === '') {
      /**
       * 1. rule & target have and only have one '/*'
       * 2. * is the last char
       */
      result = DIR_MATCH
    } else if (ruleArr.length === 2 && 
               targetArr.length === 2 &&
               targetArr[1] === '' &&
               ruleArr[1].indexOf('/') === -1) {
      /**
       * 1. rule & target have and only have one '/*'
       * 2. /* in rule should be the last slash
       * 3. /* in target should be the last 2 chars
       */
      result = PART_MATCH
    }
  }

  return result
}

/**
 * Check if a target is a remote rule
 */

exports.checkTarget = function(target) {
  const re = /^http/g
  return re.test(target)
}

/**
 * Check if a given url matches the blacklist rule
 * 
 * @param   {String}  urlString given url
 * @param   {String}  rule      black rule
 * @returns {Boolean}
 */

exports.isBlack = function(urlString, rule) {
  let result = false
  const blackType = getBlackRuleType(rule)

  if (blackType === UNKNOWN_RULE) {
    // currently we do nothing
  }

  if (blackType === FULL_MATCH) {
    result = urlString === rule ? true : false
  } else if (blackType === DIR_MATCH) {
    result = matcher.isMatch(urlString, rule) ? true : false
  } else if (blackType === PART_MATCH) {
    const fileName = urlString.split('/').pop()
    const fileNameRule = rule.split('/').pop()
    const dirPath = urlString.split(fileName)[0]
    const dirPathRule = rule.split(fileNameRule)[0]

    if (dirPath === dirPathRule &&
        matcher.isMatch(fileName, fileNameRule)) {
      result = true
    }
  }

  return result
}

function getBlackRuleType(rule) {
  let result = UNKNOWN_RULE

  if (rule.indexOf('*') === -1) {
    result = FULL_MATCH
  } else {
    const ruleArr = rule.split('/*')

    if (ruleArr.length === 2 && ruleArr[1] === '') {
      result = DIR_MATCH
    } else if (ruleArr.length === 2 && ruleArr[1].indexOf('/') === -1) {
      result = PART_MATCH
    }
  }

  return result
}

/**
 * Take url method headers to send request
 */

exports.rq = function(options, cb) {
  const urlData = url.parse(options.url)
  const defaultPort = urlData.protocol === 'https:' ? 443 : 80
  const protocol = urlData.protocol === 'https:' ? https : http

  const opt = {
    hostname: urlData.hostname,
    port: urlData.port || defaultPort,
    path: urlData.path,
    method: options.method,
    headers: options.headers
  }

  return protocol.request(opt, cb)
}

/**
 * Consume a req or res stream and put the data in Buffer
 */

exports.getStreamData = async function(stream) {
  return new Promise((resolve, reject) => {
    let bufferArray = []
    stream
      .on('data', chunk => bufferArray.push(chunk))
      .on('end', () => resolve(Buffer.concat(bufferArray)))
      .on('error', e => reject(e))
  })
}

/**
 * Parse cookies in header
 * 
 * In 'request' object, 'cookie' header is a String
 * In 'response' object, 'set-cookie' header is an Array
 */

exports.parseCookies = function(ck) {
  let cookies = {}
  if (ck) {
    if (typeof ck === 'string') {
      cookies = cookie.parse(ck)
    } else {
      cookies = cookie.parse(ck.join(';'))
    }
  }

  return cookies
}

/**
 * Kebab-case first char uppercase like:
 * 
 * kebab-case to Kebab-Case
 */

exports.capitalKebab = function(str) {
  const particals = str.split('-')

  return particals.map(item => {
    return item[0].toUpperCase() + item.slice(1)
  }).join('-')
}

/**
 * Parser for query string
 */

exports.parseQueries = function(str) {
  const rawQueries = str.split('?')[1]
  return querystring.parse(rawQueries)
}