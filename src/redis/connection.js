const redis = require("redis");

const redisClient = redis.createClient({
    // url: 'redis://redis:6379'
});

module.exports = redisClient

// (async () => {
//     await client.connect();
//     await client.set('key', 'value');
//
//     client.expireAt('key', parseInt((+new Date)/1000) + 10);
//
//     const value = await client.get('key');
//     console.log('redis', value);
//     await client.disconnect();
// })();
