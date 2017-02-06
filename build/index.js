const http = require('http');
const https = require('https');
const net = require('net');
const url = require('url');

function requestHandler(cltReq, cltRes) {
  const urlData = url.parse(cltReq.url);

  const options = {
    hostname: urlData.hostname,
    port: urlData.port || 80,
    path: urlData.path,
    method: cltReq.method,
    headers: cltReq.headers
  };

  const svrReq = http.request(options, svrRes => {
    cltRes.writeHead(svrRes.statusCode, svrRes.headers);
    svrRes.pipe(cltRes);
  }).on('error', e => {
    cltRes.end();
  });

  cltReq.pipe(svrReq);
}

function connectHandler(cltReq, cltSocket, head) {
  const urlData = url.parse(`https://${cltReq.url}`);
  const srvSocket = net.connect(urlData.port, urlData.hostname, () => {
    cltSocket.write(`HTTP/1.1 200 Connection Established
                    'Proxy-agent: Node.js-Proxy
                    '\r\n'`);
    srvSocket.write(head);
    srvSocket.pipe(cltSocket);
    cltSocket.pipe(srvSocket);
  });
}

https.createServer().on('request', requestHandler).on('connect', connectHandler).listen(3000, '0.0.0.0');