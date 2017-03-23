const http = require('http');
const url = require('url');
const { logJSON, logKeys } = require('../utils/logger.js');

function makeRequestHandler(interceptors) {
  return (req, res) => {
    const options = getOptionsFromReq(req);

    const pReq = http.request(options, pRes => {
      res.writeHead(pRes.statusCode, pRes.headers);
      pRes.pipe(res);
    }).on('error', e => {
      throw e;
    });

    req.pipe(pReq);
  };
}

/**
 * Make request options from client's incoming request
 */

function getOptionsFromReq(req) {
  const reqData = url.parse(req.url);

  const isHTTPS = reqData;

  const options = {
    host: reqData.hostname,
    port: 80,
    path: reqData.path,
    method: req.method,
    headers: req.headers
  };

  return options;
}

module.exports = makeRequestHandler;