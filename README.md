# transfer

An HTTP/HTTPS proxy server for request/response inspection

### Installation

`npm install transfer-core`

## Example

```js
const Transfer = require('transfer')

// instanciate a proxy server by giving transfer an option object
const proxyServer = new Transfer({
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhitelist: [
    'google.com'
  ]
})

proxyServer
  .on('request', reqHandler)
  .on('response', resHandler)
  .on('error', error)
  .start()
```

## API Documentations

### Constructor function

```js
const transfer = new Transfer({
  httpPort: 7777,
  httpsPort: 7778,
  httpsWhitelist: [],
  mapRules: {},
  blacklist: [],
  // ...
})
```
where

- **httpPort** port number of the http server
- **httpsPort** port number of the https server
- **httpsWhitelist** array of https domains which need to be inspected:
```js
[
  // github.com and its sub domain will be HTTPS decrypted
  'github.com', 
  // sub.github.com and its sub domain will be HTTPS decrypted
  'sub.github.com'
]
```
- **mapRules** an object of URL mapping rules:
```js
{
  'http://github.com': 'http://other.com'
}
```

