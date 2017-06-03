const EventEmitter = require('events')
class Reporter extends EventEmitter {}

/**
 * Reporter event names
 */

const REQUEST_EVENT = 'request'
const RESPONSE_EVENT = 'response'
const TRANSFER_EVENT = 'transfer'

class Interceptor {
  constructor(blackList) {
    this.blackList = blackList
    this.waitingPool = {}
    this.reporter = new Reporter()
  }

  on(event, cb) {
    this.reporter.on(event, cb)
  }

  install(req, res, id) {
    
  }

  req(req, id) {
    // const reqInfo = 

    this.waitingPool[id] = { reqInfo: reqInfo }
    this.reporter.emit('REQUEST_EVENT', {
      id: id,
      req: reqInfo
    })
  }

  res(res, id) {
    // const resInfo = 
    
    this.reporter.emit('RESPONSE_EVENT', {
      id: id,
      res: resInfo
    })
    this.reporter.emit('TRANSFER_EVENT', {
      id: id,
      req: this.waitingPool[id].reqInfo,
      res: resInfo
    })

    delete this.waitingPool[id]
  }
}

module.exports = Interceptor
