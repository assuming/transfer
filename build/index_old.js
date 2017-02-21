const http = require('http');
const https = require('https');
const net = require('net');
const fs = require('fs');
const url = require('url');
const path = require('path');

function rp(pathString) {
  return path.join(__dirname, pathString);
}

function requestHandler(cltReq, cltRes) {
  const urlData = url.parse(cltReq.url);

  console.log(urlData);

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
  console.log(urlData);
  const svrSocket = net.connect(urlData.port, urlData.hostname, () => {
    cltSocket.write(`HTTP/1.1 200 Connection Established
                    'Proxy-agent: Node.js-Proxy
                    '\r\n'`);
    svrSocket.write(head);
    svrSocket.pipe(cltSocket);
    cltSocket.pipe(svrSocket);
  });
}

const options = {
  key: fs.readFileSync(rp('../cert/private.pem')),
  cert: fs.readFileSync(rp('../cert/public.crt'))
};

https.createServer(options).on('request', requestHandler).on('connect', connectHandler).listen(3000, '0.0.0.0');

// http.createServer()
//   .on('request', requestHandler)
//   .on('connect', connectHandler)
//   .listen(3000, '0.0.0.0')