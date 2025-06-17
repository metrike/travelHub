import express from 'express';
import redis from '../services/redis.js';
import { getOffersFromMongo } from '../services/offerService.js';
import zlib from 'zlib';
import mongoose from 'mongoose';
import neo4jDriver from '../services/neo4j.js';

const router = express.Router();

// ✅ Route de test simple
router.get('/test', (req, res) => {
    res.json({ message: "Route test OK" });
});

// ✅ Route principale
router.get('/', async (req, res) => {
    const { from, to, limit = 10 } = req.query;

    if (!from || !to) {
        return res.status(400).json({ error: "Missing 'from' or 'to' parameter" });
    }

    const key = `offers:${from}:${to}`;

    try {
        const cached = await redis.get(key);
        if (cached) {
            console.log(`[CACHE HIT] ${key}`);
            const buffer = zlib.gunzipSync(Buffer.from(cached, 'base64')).toString();
            return res.json(JSON.parse(buffer));
        }

        const offers = await getOffersFromMongo(from, to, parseInt(limit));
        const compressed = zlib.gzipSync(JSON.stringify(offers)).toString('base64');
        await redis.setEx(key, 60, compressed);

        console.log(`[CACHE MISS] ${key} → ${offers.length} results`);
        res.json(offers);
    } catch (err) {
        console.error("❌ Error in GET /offers:", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Route par ID avec Neo4j
router.get('/:id', async (req, res) => {
    const offerId = req.params.id;
    const redisKey = `offers:${offerId}`;

    try {
        const cached = await redis.get(redisKey);
        if (cached) {
            console.log(`[CACHE HIT] ${redisKey}`);
            const buffer = zlib.gunzipSync(Buffer.from(cached, 'base64')).toString();
            return res.json(JSON.parse(buffer));
        }

        const Offer = mongoose.model('Offer');
        const offer = await Offer.findById(offerId).lean();
        Offer.find().then(console.log)
        if (!offer) return res.status(404).json({ error: 'Offer not found' });

        const session = neo4jDriver.session();
        const result = await session.run(`
      MATCH (c:City {code: $city})-[:NEAR]->(n:City)
      RETURN n.code AS city ORDER BY n.weight DESC LIMIT 3
    `, { city: offer.from });

        const nearbyCities = result.records.map(r => r.get('city'));

        const relatedOffers = await Offer.find({
            from: { $in: nearbyCities }
        }).limit(3).select('_id').lean();

        offer.relatedOffers = relatedOffers.map(o => o._id);

        const compressed = zlib.gzipSync(JSON.stringify(offer)).toString('base64');
        await redis.setEx(redisKey, 300, compressed);

        res.json(offer);
    } catch (err) {
        console.error("❌ Error in GET /offers/:id", err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Export obligatoire en ESModule
export default router;
