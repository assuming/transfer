const url = require('url')
const { getMappedPath } = require('../utils/utils.js')

function createMapRequestHandler(mapRules) {
  return (req, res) => {
    const urlData = url.parse(req.url)
    const filepath = getMappedPath(req.url, mapRules)

    // serve file
  }
}

module.exports = createMapRequestHandler
