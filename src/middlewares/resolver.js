import { httpsCheck, assembleURL } from '../utils/utils'

/**
 * Resolve https URL to complete URL
 */

export default function createUrlResolver() {
  return async (ctx, next) => {
    const isHttps = httpsCheck(ctx.url)

    // if HTTPS then assemble url
    if (isHttps) {
      ctx.request.url = assembleURL(ctx.request.headers.host, ctx.url)
    }

    await next()
  }
}