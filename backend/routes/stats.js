import express from 'express';
import redis   from '../services/redis.js';
import Offer   from '../models/offer.js';

const router = express.Router();

router.get('/top-destinations', async (req, res) => {
    const limit = Number(req.query.limit) || 5;
    const cacheKey = `stats:top:${limit}`;

    try {
        /* 1 ── Cache Redis -------------------------------------------------- */
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log(`[STATS CACHE HIT] ${cacheKey}`);
            return res.json(JSON.parse(cached));
        }

        /* 2 ── Agrégation MongoDB ------------------------------------------ */
        const pipeline = [
            { $group: {
                    _id:   '$to',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' }
                }},
            { $sort: { count: -1 } },      // + populaires d’abord
            { $limit: limit },
            { $project: {
                    _id: 0,
                    city: '$_id',
                    count: 1,
                    avgPrice: { $round: ['$avgPrice', 1] }
                }}
        ];

        const stats = await Offer.aggregate(pipeline).exec();

        /* 3 ── Mise en cache (300 s) --------------------------------------- */
        await redis.setEx(cacheKey, 300, JSON.stringify(stats));

        res.json(stats);
    } catch (err) {
        console.error('GET /stats/top-destinations:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
