import * as redis from 'redis'
const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379
});
async function set(key, val) {
  return await new Promise((resolve, reject)=> {
    redisClient.set([key, val], function(err, res) {
      console.log('set redis', err, res)
      resolve(res)
    });
  })
}
async function expire(key, time) {
  return await new Promise((resolve, reject)=> {
    redisClient.EXPIRE([key, time], function(err, res) {
      console.log('EXPIRE redis', err, res)
      resolve(res)
    });
  })
}
async function get(key) {
  return await new Promise((resolve, reject)=> {
    redisClient.get([key], function(err, res) {
      console.log('get redis', err, res)
      resolve(res)
    });
  })
}
export { set, expire, get }