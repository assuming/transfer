const url = require('url')
const fs = require('fs')
const send = require('koa-send')
const mime = require('mime')
const matcher = require('matcher')
const urljoin = require('url-join')
const { getMapped, checkTarget } = require('../utils/utils')

/**
 * Map local/remote middleware creator
 */

function createMapper(rules) {
  return async (ctx, next) => {
    const reqUrl = ctx.url

    const localRules = rules.local || {}
    const remoteRules = rules.remote || {}

    for (let rule of Object.keys(rules)) {
      const isRemote = checkRuleTarget(rules[rule])

      const mappedUrl = getMapped(reqUrl, {
        rule: rule,
        target: rules[rule]
      })

      if (mappedUrl) {
        if (!isRemote) {
          // local map, respond and end it
          ctx.state.collector.map = {
            mapType: 'local',
            mappedUrl: mappedUrl
          }
          await respondLocal(ctx, mappedUrl)
          return
        } else {
          // remote map, pass it to the sender
          ctx.state.collector.map = {
            mapType: 'remote',
            mappedUrl: mappedUrl
          }
          ctx.request.url = mappedUrl
        }
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