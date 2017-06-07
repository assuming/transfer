function createInterceptor(transfer) {
  return async (ctx, next) => {
    await next()
  }
}

module.exports = createInterceptor