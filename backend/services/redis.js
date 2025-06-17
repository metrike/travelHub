import { createClient } from 'redis';

const redis = createClient({ url: 'redis://redis:6379' });
await redis.connect();
export default redis;
