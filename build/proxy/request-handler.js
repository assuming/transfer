const { getOptionsFromReq } = require('../utils/utils.js');

/**
 * Request handler (listener)
 * 
 * @param  {Stream} req incoming request
 * @param  {[type]} res server response
 */
function requestHandler(req, res) {
  const options = getOptionsFromReq(req);

  const pReq = http.request(options, pRes => {
    pRes.pipe(res);
  }).on('error', e => {
    console.log(e);
  });

  req.pipe(pReq);
}

module.exports = requestHandler;