const url = require('url')
const fs = require('fs')
const send = require('koa-send')
const mime = require('mime')
const matcher = require('matcher')
const urljoin = require('url-join')
const { getMapped } = require('../utils/utils')

/**
 * Map local/remote middleware creator
 * 
 * @param {Object} map rules
 * @returns koa middleware async function
 */

function createMapper(rules) {
  return async (ctx, next) => {
    const reqUrl = ctx.url

    const localRules = rules.local || {}
    const remoteRules = rules.remote || {}

    // check for local rules
    for (let rule of Object.keys(localRules)) {
      const mappedUrl = getMapped(reqUrl, {
        rule: rule,
        target: localRules[rule]
      })

      // if mapped local, respond immediately
      if (mappedUrl) {
        await respondLocal(ctx, mappedUrl)
        return
      }
    }
    
    // check for remote rules
    for (let rule of Object.keys(remoteRules)) {
      const mappedUrl = findMappedPath(reqUrl, {
        rule: rule,
        target: remoteRules[rule]
      })

      if (mappedUrl) {
        ctx.request.url = mappedUrl
      }
    }

    await next()
  }
}

module.exports = createMapper

/**
 * Respond with local files
 */

async function respondLocal(ctx, filePath) {
  if (fs.existsSync(filePath)) {
    ctx.set('Content-Type', mime.lookup(filePath))
    await send(ctx, filePath)
  } else {
    ctx.status = 404
    ctx.body = '404 not found\n'
  }
}