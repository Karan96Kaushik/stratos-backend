const { createClient } = require('redis');

const REDIS_CREDENTIALS = {
    host: process.env.redisHOST || '127.0.0.1',
    port: process.env.redisPORT || '6379',
    password: process.env.redisPASS
}

const redisPass = REDIS_CREDENTIALS.password ? `default:${REDIS_CREDENTIALS.password}@` : ''
const client = createClient({url: `redis://${redisPass}${REDIS_CREDENTIALS.host}:${REDIS_CREDENTIALS.port}`});

client.on('error', (err) => console.log('Redis Client Error', err));

client.connect().then(() => console.log("Redis Client Connected"));

module.exports = client