import path from 'path'
import fs from 'fs'

/**
 * Intercept CA certificate request and send the cert back
 */

export default function createCaChecker(certsPath) {
  const caPath = path.join(certsPath, 'ca', 'ca.crt')
  
  return async (ctx, next) => {
    if (isCaRequest(ctx.url)) {
      const fileStream = fs.createReadStream(caPath)

      ctx.status = 200
      ctx.set({
        'Content-Type': 'application/x-x509-ca-cert',
        'Content-Disposition': 'attachment; filename=ca_cert'
      })
      ctx.body = fileStream

      return
    }

    await next()
  }
}

function isCaRequest(urlString) {
  if (urlString.indexOf('http://get.ca/') !== -1) {
    return true
  }

  return false
}