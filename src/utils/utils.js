import url from 'url'
import http from 'http'
import https from 'https'
import querystring from 'querystring'
import tls from 'tls'
import path from 'path'
import crypto from 'crypto'
import matcher from 'matcher'
import urljoin from 'url-join'
import cookie from 'cookie'


/**
 * Promisified server close function
 */

export function stopServer(server) {
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

export function httpsCheck(urlString) {
  const result = urlString.indexOf('http://') < 0 ? true : false
  return result
}

/**
 * Assemble URL using given host header and path (https server)
 */

export function assembleURL(host, _path) {
  const _url = `https://${path.join(host, _path)}`
  return _url
}

/**
 * Create random id for each session
 */

export function randomId() {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Make path for '~/'
 */

export function getHomePath() {
  // only works on *nix
  return process.env.HOME
}

/**
 * Check if a given host matches any domain in the whitelist
 */

export function isInList(hostname, list) {
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

export function getMapped(urlString, ruleObj) {
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
    }
  }

  return result
}

/**
 * Check if a target is a remote rule
 */

export function checkTarget(target) {
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

export function isBlack(urlString, rule) {
  let result = false
  const blackType = getBlackRuleType(rule)

  if (blackType === UNKNOWN_RULE) {
    // currently we do nothing
  }

  if (blackType === FULL_MATCH) {
    result = urlString === rule ? true : false
  } else if (blackType === DIR_MATCH) {
    result = matcher.isMatch(urlString, rule) ? true : false
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
    }
  }

  return result
}

/**
 * Take url method headers to send request
 */

export function rq(options, cb) {
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

export async function getStreamData(stream) {
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

export function parseCookies(ck) {
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

export function capitalKebab(str) {
  const particals = str.split('-')

  return particals.map(item => {
    return item[0].toUpperCase() + item.slice(1)
  }).join('-')
}

/**
 * Parser for query string
 */

export function parseQueries(str) {
  const rawQueries = str.split('?')[1]
  return querystring.parse(rawQueries)
}