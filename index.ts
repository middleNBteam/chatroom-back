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
import status from './status'
import * as redis from './reidsFunction'
import { Certificate } from 'crypto';
const USER_LOGIN_TOKEN_LIMIT_TIME = 300
app.use(bodyparser({multipart:true}))

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  // if(ctx.method === 'OPTIONS') {
  //   let allow = ctx.get('Allow');
  //   ctx.set('Allow', `${allow}, OPTIONS`);
  // }
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// options请求处理
app.use(async (ctx, next) =>{
  if(ctx.method === 'OPTIONS') {
    ctx.status = 204
    ctx.set('Access-Control-Allow-Origin', `*`);
    ctx.set('Access-Control-Allow-Headers', `X-Requested-With, Content-Type, Accept, Authorization`);
    ctx.set('Access-Control-Allow-Methods', `GET,PUT,OPTIONS,DELETE,PATCH`);
    ctx.set('Access-Control-Max-Age', 3600);
    ctx.body = `sucess`
    return
  }
  await next();
})

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  ctx.set('Access-Control-Allow-Origin', `*`);
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
  if(requestData.username === undefined || requestData.passwords === undefined || requestData.username.trim() === '' || requestData.passwords.trim() === '') {
    ctx.body = status['注册数据错误']
    return
  }
  const checkUserIsExitSql = `SELECT username FROM usinguser WHERE username = "${requestData.username}";`
  const checkResult = await searchSql(checkUserIsExitSql);
  if((checkResult as Array<any>).length > 0 ) {
    ctx.body = status['用户名已存在']
    return
  }
  const userId = createToken()
  const addUserSql = `INSERT INTO users (userid, username, passwords) VALUES ("${userId}", "${requestData.username}", "${requestData.passwords}");`
  try {
    const result = await searchSql(addUserSql)
    console.log('result', result)
    ctx.body = status['成功注册']
  } catch(err) {
    ctx.body = err
  }
  // ctx.router available
});
router.post('/loginusers', async (ctx, next) => {
  const requestData = ctx.request.body;
  const checkUserIsExitSql = `SELECT userid, username FROM usinguser WHERE username = "${requestData.username}" AND passwords = "${requestData.passwords}";`
  
  try {
    const checkResult = await searchSql(checkUserIsExitSql);
    if((checkResult as Array<any>).length > 0 ) {
      const existToken = await redis.get(`user:${checkResult[0].userid}`)
      let token = existToken
      if(!existToken) {
        token = createToken()
        const r1 = await redis.set(`user:${checkResult[0].userid}`, token)
        const r2 = await redis.expire(`user:${checkResult[0].userid}`, USER_LOGIN_TOKEN_LIMIT_TIME)
        const r3 = await redis.set(`token:${token}`, checkResult[0].userid)
        const r4 = await redis.expire(`token:${token}`, USER_LOGIN_TOKEN_LIMIT_TIME)
      }
      ctx.body = {
        ...status['登陆成功'],
        token: token
      }
    } else {
      ctx.body = status['用户名或密码错误']
    }
  } catch(err) {
    ctx.body = err
  }
  // ctx.router available
});

router.post('/deleteuser', async (ctx, next) => {
  const requestData = ctx.request.body;
  const checkUserIsExitSql = `SELECT userid FROM usinguser WHERE username = "${requestData.username}" AND passwords = "${requestData.passwords}";`

  try {
    const checkResult = await searchSql(checkUserIsExitSql);
    if((checkResult as Array<any>).length > 0 ) {
      const deleteUserSql = `UPDATE users SET isdelete = 1 WHERE userid = "${checkResult[0].userid}" AND isdelete = 0;`
      const deleteResult = await searchSql(deleteUserSql);
      ctx.body = status['删除成功']
    } else {
      ctx.body = status['用户名或密码错误']

    }
  } catch(err) {
    ctx.body = err
  }
  // ctx.router available
});

router.post('/getData/all', async (ctx, next) => {
  const result = await next()
  if(!result) {
    return
  }
  ctx.body = {
    a: 111,
    b: 222
  };
  // ctx.router available
});

// 验证token有效期中间件
router.post('/getData/:thing', async (ctx, next) => {
  const requestData = ctx.request.header;
  const userId = await redis.get(`token:${requestData.token}`)
  if(!userId) {
    ctx.body = status['登陆已过期']
    return false
  }
  const uesrToken = await redis.get(`user:${userId}`)
  if(uesrToken !== requestData.token) {
    ctx.body = status['登陆已过期']
    return false
  }
  return true
});
app
  .use(router.routes())
  .use(router.allowedMethods());




// app.listen(3000);
console.log('start1')
http.createServer(app.callback()).listen(3000);
// https.createServer(app.callback()).listen(3001);

function createToken(): string {
  return (uuidv4() as string).replace(/-/g, '')
}
