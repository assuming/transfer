const { isBlack } = require('../utils/utils')

/**
 * Black list blocker creator
 * 
 * @param {Array} array for black rules
 * @returns koa middleware async function
 */

function createBlocker(blackList) {
  return async (ctx, next) => {
    const reqUrl = ctx.url

    for (let rule of blackList) {
      if (isBlack(reqUrl, rule)) {
        await blockRespond(ctx)
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

async function blockRespond(ctx) {
  
}