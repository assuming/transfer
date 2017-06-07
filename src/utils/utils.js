const url = require('url')
const tls = require('tls')
const path = require('path')
const crypto = require('crypto')
const matcher = require('matcher')
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
 * @param   {Object} ruleObj contains rule & target fields
 * @returns {String} or false
 */

exports.getMapped = function(urlString, ruleObj) {
  const rule = ruleObj.rule
  const target = ruleObj.target
  let result = false

  const ruleType = getRuleType(ruleObj)

  if (ruleType === UNKNOWN_RULE) {
    // throw error
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
 * Check if a given url matches the blacklist rule
 * 
 * @param   {String}
 * @param   {String}
 * @returns {Boolean}
 */

exports.isBlack = function(urlString, rule) {
  let result = false
  const blackType = getBlackRuleType(rule)

  if (blackType === UNKNOWN_RULE) {
    // throw error
  }

  if (blackType === FULL_MATCH) {
    result = urlString === rule ? true : false
  } else if (ruleType === DIR_MATCH) {
    result = matcher.isMatch(urlString, rule) ? true : false
  } else if (ruleType === PART_MATCH) {
    const fileName = urlString.split('/').pop()
    const fileNameRule = rule.split('/').pop()
    const dirPath = urlString.split(fileName)[0]
    const dirPathRule = rule.split(fileNameRule)[0]

    if (dirPath === dirPathRule &&
        matcher.isMatch(fileName, fileNameRule)) {
      result = true
    }
  }
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