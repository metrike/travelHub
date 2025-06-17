import express from 'express';
import redis from '../services/redis.js';
import driver from '../services/neo4j.js';
import zlib from 'zlib';

const router = express.Router();

router.get('/', async (req, res) => {
    const { city, k } = req.query;

    if (!city || !k) {
        return res.status(400).json({ error: "Missing 'city' or 'k' parameter" });
    }

    const redisKey = `reco:city:${city}:k:${k}`;

    try {
        const cached = await redis.get(redisKey);
        if (cached) {
            console.log(`[CACHE HIT] ${redisKey}`);
            const buffer = zlib.gunzipSync(Buffer.from(cached, 'base64')).toString();
            return res.json(JSON.parse(buffer));
        }

        const session = driver.session();
        const query = `
            MATCH (c:City {code: $city})-[r:NEAR]->(n:City)
            RETURN n.code AS city, r.weight AS score
            ORDER BY score DESC
            LIMIT toInteger($k)
        `;
        const result = await session.run(query, { city, k: parseInt(k) });
        await session.close();

        const recommendations = result.records.map(record => {
            const obj = record.toObject();
            return {
                city: obj.city,
                score: obj.score
            };
        });


        const compressed = zlib.gzipSync(JSON.stringify(recommendations)).toString('base64');
        await redis.setEx(redisKey, 300, compressed);

        res.json(recommendations);
    } catch (err) {
        console.error('❌ Error in GET /reco:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
