import express  from 'express';
import zlib     from 'zlib';
import redis    from '../services/redis.js';
import neo4j    from '../services/neo4j.js';
import Offer    from '../models/offer.js';

import {
    httpRequestDuration,
    cacheHitCounter,
    cacheMissCounter
} from '../services/metrics.js';

const router = express.Router();

const withMetrics = (route, handler) => async (req, res, next) => {
    const end = httpRequestDuration.startTimer({ route, method: req.method });
    try {
        await handler(req, res, next);
        end({ status: res.statusCode });
    } catch (err) {
        end({ status: 500 });
        next(err);
    }
};

/* ───────────────────────────── Test rapide ─────────────────────────────── */
router.get(
    '/test',
    withMetrics('/offers/test', async (_, res) => {
        const sample = await Offer.find().limit(3).lean();
        console.table(sample);
        res.json({ message: '✅ Route test OK', sample });
    })
);

/* ───────────────────────────── Création ─────────────────────────────────── */
router.post(
    '/',
    withMetrics('/offers [POST]', async (req, res) => {
        const newOffer = await Offer.create(req.body);

        await redis.publish(
            'offers:new',
            JSON.stringify({
                offerId: newOffer._id.toString(),
                from:    newOffer.from,
                to:      newOffer.to
            })
        );

        res.status(201).json(newOffer);
    })
);

/* ────────────────────── Liste des offres (GET /offers) ─────────────────── */
router.get(
    '/',
    withMetrics('/offers', async (req, res) => {
        const { from, to, limit = 10, q = '' } = req.query;

        if (!from?.trim() || !to?.trim()) {
            return res.status(400).json({ error: 'Missing "from" or "to" parameters' });
        }

        const cacheKey = `offers:${from}:${to}:q:${q.toLowerCase()}`;

        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                cacheHitCounter.inc();
                console.log(`[CACHE HIT] ${cacheKey}`);
                return res.json(
                    JSON.parse(zlib.gunzipSync(Buffer.from(cached, 'base64')))
                );
            }
        } catch (err) {
            console.warn('Redis GET error:', err.message);
        }
        cacheMissCounter.inc();

        const filter = { from, to };
        if (q.trim()) {
            const regex = new RegExp(q, 'i');
            filter.$or = [
                { provider: regex },
                { 'hotel.name': regex },
                { 'activity.title': regex }
            ];
        }

        const offers = await Offer.find(filter)
            .sort({ price: 1 })
            .limit(Number(limit))
            .lean();

        try {
            await redis.setEx(
                cacheKey,
                60,
                zlib.gzipSync(JSON.stringify(offers)).toString('base64')
            );
        } catch (err) {
            console.warn('Redis SET error:', err.message);
        }

        res.json(offers);
    })
);

/* ───────────── Détail + suggestions (GET /offers/:id) ───────────── */
router.get('/:id', withMetrics('/offers/:id', async (req, res) => {
    const redisKey = `offers:${req.params.id}`;

    /* Cache Redis */
    const cached = await redis.get(redisKey);
    if (cached) {
        cacheHitCounter.inc();
        return res.json(JSON.parse(zlib.gunzipSync(Buffer.from(cached, 'base64'))));
    }
    cacheMissCounter.inc();

    /* Offre principale */
    const offer = await Offer.findById(req.params.id).lean();
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    /* Villes de départ proches (Neo4j) */
    const session = neo4j.session();
    const result  = await session.run(
        `MATCH (c:City {code:$city})-[:NEAR]->(n) RETURN n.code AS city LIMIT 3`,
        { city: offer.from }
    );
    await session.close();
    const nearbyCities = result.records.map(r => r.get('city'));

    /* Fenêtre ±10 jours autour de la date de départ */
    const start = new Date(offer.departDate); start.setDate(start.getDate() - 10);
    const end   = new Date(offer.departDate); end.setDate(end.getDate() + 10);

    /* Recherche d’offres vraiment similaires */
    const related = await Offer.find({
        from:      { $in: nearbyCities },
        to:        offer.to,               // ✅ même destination (NYC)
        _id:       { $ne: offer._id },     // ✅ pas soi-même
        departDate:{ $gte: start, $lte: end } // ✅ dates proches
    })
        .sort({ price: 1 })
        .limit(3)
        .select('_id')
        .lean();

    offer.relatedOffers = related.map(o => o._id);

    /* Cache 5 min */
    await redis.setEx(
        redisKey,
        300,
        zlib.gzipSync(JSON.stringify(offer)).toString('base64')
    );

    res.json(offer);
    })
);


export default router;
