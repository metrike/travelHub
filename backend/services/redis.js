// backend/services/redis.js
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const redis = createClient({ url: REDIS_URL });

redis.on('error', err => {
  console.error('❌ Redis Client Error', err);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

(async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error('💥 Failed to connect to Redis:', err);
    process.exit(1);
  }
})();

export default redis;
