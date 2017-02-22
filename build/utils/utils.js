const url = require('url');

/**
 * Make request options from client's incoming request
 */
exports.getOptionsFromReq = function (req) {
  const _reqData = url.parse(req.url);
  const isHTTPS = _reqData;

  const options = {
    host: _reqData.hostname,
    port: 80,
    path: _reqData.path,
    method: req.method,
    headers: req.headers
  };

  return options;
};