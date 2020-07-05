// const Koa = require('koa');
import * as Koa from 'koa'
// import * as https from 'https'
import * as http from 'http'
import * as Router from '@koa/router'
import * as bodyparser from 'koa-body'
const app = new Koa();
const router = new Router();
import {searchSql} from './searchSql'
import { v4 as uuidv4 } from 'uuid';
app.use(bodyparser({multipart:true}))

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// response
router.get('/', (ctx, next) => {
  ctx.body = 'body';
  // ctx.router available
});
router.get('/users/:id', (ctx, next) => {
  ctx.body = ctx.params.id;
  // ctx.router available
});
router.post('/users', async (ctx, next) => {
  ctx.body = ctx.request.body;
  // ctx.router available
});
router.post('/addusers', async (ctx, next) => {
  const requestData = ctx.request.body;
  const checkUserIsExitSql = `SELECT username FROM users WHERE username = "${requestData.username}";`
  const checkResult = await searchSql(checkUserIsExitSql);
  if((checkResult as Array<any>).length > 0 ) {
    ctx.body = {
      status: 701,
      msg: '用户已存在'
    }
    return
  }
  const addUserSql = `INSERT INTO users (username, passwords) VALUES ("${requestData.username}", "${requestData.passwords}");`
  try {
    const result = await searchSql(addUserSql)
    console.log('result', result)
    ctx.body = result
  } catch(err) {
    ctx.body = err
  }
  // ctx.router available
});
router.post('/loginusers', async (ctx, next) => {
  const requestData = ctx.request.body;
  const checkUserIsExitSql = `SELECT username FROM users WHERE username = "${requestData.username}" AND passwords = "${requestData.passwords}";`
  
  try {
    const checkResult = await searchSql(checkUserIsExitSql);
    if((checkResult as Array<any>).length > 0 ) {
      ctx.body = {
        status: 200,
        msg: '登陆成功',
        token: uuidv4()
      }
    } else {
      ctx.body = {
        status: 702,
        msg: '用户名或密码错误'
      }
    }
  } catch(err) {
    ctx.body = err
  }
  // ctx.router available
});
app
  .use(router.routes())
  .use(router.allowedMethods());




// app.listen(3000);
console.log('start')
http.createServer(app.callback()).listen(3000);
// https.createServer(app.callback()).listen(3001);

