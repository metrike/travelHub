import express from 'express';
import zlib    from 'zlib';
import redis   from '../services/redis.js';
import neo4j   from '../services/neo4j.js';
import Offer   from '../models/offer.js';
import { getOffersFromMongo } from '../services/offerService.js';

const router = express.Router();

/* ───────────────────────────── Tests rapides ─────────────────────────────── */
router.get('/test', async (_, res) => {
    const sample = await Offer.find().limit(3).lean();
    console.table(sample);
    res.json({ message: 'Route test OK', sample });
});

/* ───────────────────────────── Création d’offre ──────────────────────────── */
router.post('/', async (req, res) => {
    try {
        const newOffer = await Offer.create(req.body);

        // Publie l’événement temps-réel
        await redis.publish(
            'offers:new',
            JSON.stringify({
                offerId: newOffer._id.toString(),
                from:    newOffer.from,
                to:      newOffer.to
            })
        );

        res.status(201).json(newOffer);
    } catch (err) {
        console.error('❌ POST /offers', err);
        res.status(500).json({ error: err.message });
    }
});

/* ─────────────────────────── Liste d’offres (GET /offers) ────────────────── */
router.get('/', async (req, res) => {
    const { from, to, limit = 10 } = req.query;
    if (!from || !to) {
        return res.status(400).json({ error: "Missing 'from' or 'to' parameter" });
    }

    const cacheKey = `offers:${from}:${to}`;
    try {
        /* Cache Redis ---------------------------------------------------------- */
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log(`[CACHE HIT] ${cacheKey}`);
            return res.json(JSON.parse(zlib.gunzipSync(Buffer.from(cached, 'base64'))));
        }

        /* MongoDB -------------------------------------------------------------- */
        const offers = await getOffersFromMongo(from, to, Number(limit));

        /* Mise en cache (60 s) -------------------------------------------------- */
        await redis.setEx(
            cacheKey,
            60,
            zlib.gzipSync(JSON.stringify(offers)).toString('base64')
        );

        console.log(`[CACHE MISS] ${cacheKey} → ${offers.length} results`);
        res.json(offers);
    } catch (err) {
        console.error('❌ GET /offers', err);
        res.status(500).json({ error: err.message });
    }
});

/* ─────────────── Détails d’une offre + suggestions (GET /offers/:id) ─────── */
router.get('/:id', async (req, res) => {
    const redisKey = `offers:${req.params.id}`;

    try {
        /* Cache --------------------------------------------------------------- */
        const cached = await redis.get(redisKey);
        if (cached) {
            console.log(`[CACHE HIT] ${redisKey}`);
            return res.json(JSON.parse(zlib.gunzipSync(Buffer.from(cached, 'base64'))));
        }

        /* Lecture Mongo ------------------------------------------------------- */
        const offer = await Offer.findById(req.params.id).lean();
        if (!offer) return res.status(404).json({ error: 'Offer not found' });

        /* Recommandations via Neo4j ------------------------------------------ */
        const session = neo4j.session();
        const cypher  = `
      MATCH (c:City {code: $city})-[:NEAR]->(n:City)
      RETURN n.code AS city
      ORDER BY n.weight DESC
      LIMIT 3
    `;
        const result = await session.run(cypher, { city: offer.from });
        await session.close();

        const nearbyCities = result.records.map(r => r.get('city'));
        const related = await Offer
            .find({ from: { $in: nearbyCities } })
            .limit(3)
            .select('_id')
            .lean();

        offer.relatedOffers = related.map(o => o._id);

        await redis.setEx(
            redisKey,
            300,
            zlib.gzipSync(JSON.stringify(offer)).toString('base64')
        );

        res.json(offer);
    } catch (err) {
        console.error('❌ GET /offers/:id', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
