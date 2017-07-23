# transfer

An HTTP/HTTPS proxy server for request/response inspection

### Installation

`npm install -S transfer-core`

## Example

```js
const Transfer = require('transfer')

// instanciate a proxy server by giving transfer an option object
const proxyServer = new Transfer({
  port: 7777,
  httpsWhitelist: [
    'google.com'
  ]
})

proxyServer
  .on('request', requestData => {})
  .on('response', responseData => {})
  .on('error', err => {})
  .start()
```

## API Documentations

### Constructor function

```js
const options = {
  port: 7777,
  httpsWhitelist: [],
  mapRules: {},
  blacklist: [],
  certsPath: '/path/to/a/folder',
  opensslPath: '/path/to/openssl/executable',
  caCertName: 'common name for CA cert'
}

const transfer = new Transfer(options)
```
where `options` are:

- **port** is the port number of the server, default `7777`
- **httpsWhitelist** is an array of https domains which need to be inspected:
```js
[
  // github.com and its sub domain will be HTTPS decrypted
  "github.com", 
  // sub.github.com and its sub domain will be HTTPS decrypted
  "sub.github.com"
]
```
- **mapRules** is an object of URL mapping rules:
```js
{
  // map an url to another path(remote path or local path is both ok)
  "http://github.com": "http://another.com",
  // map a directory to another directory, the last character must be *
  "http://github.com/*": "/path/to/directory/*"
}
```
- **blacklist** is an array of url patterns that blocks request if matched:
```js
[
  // block an url
  "http://github.com/main.css",
  // block a whole directory
  "http://github.com/*"
]
```
- **certsPath** is a path to a directory that used to store the certificates, default `~/.transfer_certs`
- **opensslPath** is the path for openssl executable. **Transfer uses openssl to generate certificates**. If not provided, uses the systems's default openssl command.
- **caCertName** is the `common name` for CA certificates, default is `Transfer Proxy CA`

### Listen for requests and responses

Transfer instance itself is an `EventEmitter`. It fires events everytime a request/response arrived and everytime an error occurred.

```js
const transfer = new Transfer(options)

transfer
  .on('request', requestHandler)
  .on('response', responseHandler)
  .on('error', errorHandler)
```

#### Event: 'request'

Emitted when request arrived, pass the request data object to the given callback.

```js
function requestHandler(reqData) {
  // do anything you want with reqData
}
```

#### Event: 'response'

Emitted when the response arrived, pass the response data object to the given callback.

```js
function requestHandler(resData) {
  // do anything you want with resData
}
```

If you do not want to react to the `request` event, i.e. you just want to do something when the HTTP data transfer is complete. Just listen for `response` event.

`reqData` and `resData` contains the same fields listed below. The only difference is `reqData` only has a few things set(the data that describes the response can't be set cause response hasn't arrived at that time. So those part of data remains default).

<!--TODO: Finished doc  -->

#### Data structure (except for CONNECT method) 

```js
{
  crypted: false,
  id: '',
  status: 'Fetching',
  url: '',
  method: '',
  protocol: '',
  request: {
    raw: '',
    headers: {},
    cookies: {},
    queries: {},
    body: ''
  },

  map: {
   mapType: '',
   mappedUrl: ''
  },
  blocked: false,

  statusCode: '',
  statusMessage: '',
  timings: {
    startTime: 0,
    wait: 0,
    dns: 0,
    tcp: 0,
    firstByte: 0,
    download: 0,
    total: 0,
    endTime: 0
  },
  response: {
    raw: '',
    headers: {},
    cookies: {},
    body: ''
  }
}
```

#### Data structure for CONNECT method

```js
{
  crypted: true,
  id: '',
  status: 'Fetching',
  method: 'CONNECT',
  url: '',
  protocol: 'https',
  protocolVersion: '',

  timings: {
    startTime: 0,
    total: 0,
    endTime: 0
  }
}
```


### Listen for errors

### Start and stop the proxy



## Certificates explaination