const redis = require("redis");

const redisClient = redis.createClient({
    host: 'redis',
    port: '6379'
});

module.exports = redisClient
