const url = require('url')
const fs = require('fs')
const path = require('path')
const { getMappedPath } = require('../utils/utils.js')

/**
 * Supported mime types
 */

const MIME_TYPES = {
  'html': 'text/html',
  'js': 'text/javascript',
  'css': 'text/css',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'json': 'application/json',
  'ico': 'image/x-icon',
  'wav': 'audio/wav',
  'mp3': 'audio/mpeg',
  'svg': 'image/svg+xml',
  'pdf': 'application/pdf',
  'doc': 'application/msword'
}


/**
 * Map server's request handler creator
 * 
 * @param  {Object}   mapRules user defined map rules object
 * @return {Function}          requestHandler for map server
 */
function createMapRequestHandler(mapRules) {
  return (req, res) => {
    const urlData = url.parse(req.url)
    const filepath = getMappedPath(req.url, mapRules)

    if (fs.existsSync(filepath)) {
      // set mime type and status code
      const mimeType = MIME_TYPES[path.extname(filepath).split('.')[1]]
      res.writeHead(200, {
        'Content-Type': mimeType || 'text/plain'
      })

      const filestream = fs.createReadStream(filepath)
      filestream.pipe(res)
    } else {
      res.writeHead(404, {
        'Content-Type': 'text/plain'
      })

      res.write('404 not found\n')
      res.end()
    }
  }
}

module.exports = createMapRequestHandler
