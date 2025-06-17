import express from 'express';
import redis from '../services/redis.js';
import { getOffersFromMongo } from '../services/offerService.js';
import zlib from 'zlib';

const router = express.Router();

router.get('/', async (req, res) => {
    const { from, to, limit = 10 } = req.query;
    const key = `offers:${from}:${to}`;

    try {
        const cached = await redis.get(key);
        if (cached) {
            const buffer = zlib.gunzipSync(Buffer.from(cached, 'base64')).toString();
            return res.json(JSON.parse(buffer));
        }

        const offers = await getOffersFromMongo(from, to, parseInt(limit));
        const compressed = zlib.gzipSync(JSON.stringify(offers)).toString('base64');
        await redis.setEx(key, 60, compressed);

        res.json(offers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
