const url = require('url')
const fs = require('fs')
const send = require('koa-send')
const mime = require('mime')
const matcher = require('matcher')
const urljoin = require('url-join')
const { getMapped } = require('../utils/utils')

/**
 * Map local/remote middleware creator
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
        ctx.state.collector.map = {
          mapType: 'local',
          mappedUrl: mappedUrl
        }
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

      // if mapped remote, change the current url
      // to a new one, and send as usual
      if (mappedUrl) {
        ctx.state.collector.map = {
          mapType: 'remote',
          mappedUrl: mappedUrl
        }
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