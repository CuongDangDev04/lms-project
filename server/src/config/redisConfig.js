const redis = require('redis');
const dotenv = require('dotenv');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

process.on('SIGINT', async () => {
    await redisClient.quit();
    console.log('Redis client disconnected');
    process.exit(0);
});

module.exports = redisClient;