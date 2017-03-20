const http = require('http');
const url = require('url');
const { getOptionsFromReq } = require('../utils/utils.js');
const { logJSON, logKeys } = require('../utils/logger.js');

/**
 * Request handler (listener)
 * 
 * @param  {Stream}  req  incoming request
 * @param  {Stream}  res  server response
 */
function requestHandler(req, res) {
  const options = getOptionsFromReq(req);

  const pReq = http.request(options, pRes => {
    res.writeHead(pRes.statusCode, pRes.headers);
    pRes.pipe(res);
  }).on('error', e => {
    console.log(e);
  });

  req.pipe(pReq);
}

module.exports = requestHandler;