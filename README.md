# transfer

An HTTP/HTTPS proxy server for debugging use. For CLI version, click [HERE](https://github.com/assuming/transfer-cli.git)

### Example

```js
const Transfer = require('transfer')

const options = {
  port: 5555,
  interceptors: 'path/to/interceptors'
}

// instanciate a proxy server by giving transfer an option object
const proxyServer = new Transfer(options)

proxyServer.start()
```

### APIs

##### options

Options are used to config a proxy. It's passed to the proxy through the constructor function.

```js
{
  // default listening port
  port: 5555,
  // interceptors file path or an object containing interceptors
  interceptors: 'path/to/interceptors'

}
```

##### Filters
