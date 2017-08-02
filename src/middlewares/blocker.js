const { isBlack } = require('../utils/utils')

/**
 * Black list blocker creator
 */

function createBlocker(hotOptions) {
  return async (ctx, next) => {
    const blacklist = hotOptions.blacklist
    const reqUrl = ctx.url

    for (let rule of blacklist) {
      if (isBlack(reqUrl, rule)) {
        // mark blocked
        ctx.state.collector.blocked = true
        blockRespond(ctx)
        return
      }
    }

    await next()
  }
}

module.exports = createBlocker

/**
 * Block the response by 404
 */

function blockRespond(ctx) {
  ctx.status = 404
  ctx.body = 'Transfer blocked\n'
}