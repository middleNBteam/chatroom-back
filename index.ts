// const Koa = require('koa');
import * as Koa from 'koa'
const app = new Koa();

app.use(async ctx => {
  ctx.body = 'Hello World2';
});

app.listen(3000);
console.log('start')

