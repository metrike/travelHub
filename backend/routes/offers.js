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

router.get('/:id', async (req, res) => {
    const offerId = req.params.id;
    const redisKey = `offers:${offerId}`;

    try {
        // 1. Vérifier le cache Redis
        const cached = await redis.get(redisKey);
        if (cached) {
            const buffer = zlib.gunzipSync(Buffer.from(cached, 'base64')).toString();
            return res.json(JSON.parse(buffer));
        }

        // 2. Récupérer l’offre par ID depuis Mongo
        const Offer = mongoose.model('Offer');
        const offer = await Offer.findById(offerId).lean();

        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        // 3. Appeler Neo4j pour récupérer les villes proches
        const fromCity = offer.from; // ex: Paris, Tokyo, etc.
        const session = neo4jDriver.session();
        const query = `
      MATCH (c:City {code: $city})-[:NEAR]->(n:City)
      RETURN n.code AS city ORDER BY n.weight DESC LIMIT 3
    `;
        const result = await session.run(query, { city: fromCity });
        const nearbyCities = result.records.map(r => r.get('city'));

        // 4. Chercher jusqu’à 3 offres avec from in nearbyCities
        const relatedOffers = await Offer.find({
            from: { $in: nearbyCities }
        }).limit(3).select('_id').lean();

        offer.relatedOffers = relatedOffers.map(o => o._id);

        // 5. Cacher dans Redis
        const compressed = zlib.gzipSync(JSON.stringify(offer)).toString('base64');
        await redis.setEx(redisKey, 300, compressed);

        res.json(offer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
