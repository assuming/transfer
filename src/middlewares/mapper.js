import url from 'url'
import util from 'util'
import fs from 'fs'
import mime from 'mime'
import matcher from 'matcher'
import { getMapped, checkTarget } from '../utils/utils'

/**
 * Map local/remote middleware creator
 */

export default function createMapper(hotOptions) {
  return async (ctx, next) => {
    const rules = hotOptions.mapRules
    const reqUrl = ctx.url

    for (let rule of Object.keys(rules)) {
      const isRemote = checkTarget(rules[rule])

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
          // remote map, first mark in collector
          ctx.state.collector.map = {
            mapType: 'remote',
            mappedUrl: mappedUrl
          }

          // replace the URL
          ctx.request.url = mappedUrl
          // replace the host header with the new host
          ctx.request.headers.host = url.parse(mappedUrl).hostname
        }
      }
    }

    await next()
  }
}

/**
 * Respond with local files
 */

async function respondLocal(ctx, filePath) {
  if (fs.existsSync(filePath)) {
    const readFile = util.promisify(fs.readFile)
    // serve files from the root directory
    const bodyData = await readFile(filePath)

    ctx.set('Content-Type', mime.lookup(filePath))
    ctx.status = 200
    ctx.body = bodyData
  } else {
    ctx.status = 404
    ctx.body = '404 not found\n'
  }
}