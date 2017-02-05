const request = require('superagent');
const Koa = require('koa');
const app = new Koa();

app.use(ctx => {
  ctx.body = JSON.stringify(ctx, null, 4);
});

app.listen(7777);