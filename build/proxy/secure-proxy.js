const https = require('https');
const url = require('url');

const secureProxy = https.createServer({});

module.exports = secureProxy;