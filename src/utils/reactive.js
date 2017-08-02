/**
 * Make property inside an Object reactive
 */

function makeReactive(obj) {
  const reactiveObj = {}

  Object.keys(obj).forEach(key => {
    let val = obj[key]

    Object.defineProperty(reactiveObj, key, {
      enumerable: true,
      configurable: true,

      get() {
        return val
      },
      set(newVal) {
        val = newVal
      }
    })
  })

  return reactiveObj
}

module.exports = makeReactive