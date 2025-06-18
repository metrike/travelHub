/* ────────────────────────────── DEPENDANCES ────────────────────────────── */
import express  from 'express';
import zlib     from 'zlib';
import redis    from '../services/redis.js';
import neo4j    from '../services/neo4j.js';
import Offer    from '../models/offer.js';

/* ▸ métriques Prometheus */
import {
    httpRequestDuration,
    cacheHitCounter,
    cacheMissCounter
} from '../services/metrics.js';

const router = express.Router();

/* Helper pour mesurer la latence d’un handler */
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

        /* 1 ─ Validation simple */
        if (!from?.trim() || !to?.trim()) return res.json([]);

        /* 2 ─ Clé de cache (on normalise q en minuscules) */
        const cacheKey = `offers:${from}:${to}:q:${q.toLowerCase()}`;

        /* 3 ─ Tentative de cache */
        const cached = await redis.get(cacheKey);
        if (cached) {
            cacheHitCounter.inc();
            console.log(`[CACHE HIT] ${cacheKey}`);
            return res.json(
                JSON.parse(zlib.gunzipSync(Buffer.from(cached, 'base64')))
            );
        }
        cacheMissCounter.inc();

        /* 4 ─ Filtre MongoDB + éventuel texte libre */
        const filter = { from, to };
        if (q.trim()) {
            const regex = new RegExp(q, 'i');
            filter.$or = [
                { provider: regex },
                { 'hotel.name': regex },
                { 'activity.title': regex }
            ];
        }

        /* 5 ─ Query + tri */
        const offers = await Offer.find(filter)
            .sort({ price: 1 })
            .limit(Number(limit))
            .lean();

        /* 6 ─ On compresse et on met 60 s en cache */
        await redis.setEx(
            cacheKey,
            60,
            zlib.gzipSync(JSON.stringify(offers)).toString('base64')
        );

        res.json(offers);
    })
);

/* ─────────────── Détails + suggestions (GET /offers/:id) ──────────────── */
router.get(
    '/:id',
    withMetrics('/offers/:id', async (req, res) => {
        const redisKey = `offers:${req.params.id}`;

        /* Cache */
        const cached = await redis.get(redisKey);
        if (cached) {
            cacheHitCounter.inc();
            console.log(`[CACHE HIT] ${redisKey}`);
            return res.json(
                JSON.parse(zlib.gunzipSync(Buffer.from(cached, 'base64')))
            );
        }
        cacheMissCounter.inc();

        /* Mongo */
        const offer = await Offer.findById(req.params.id).lean();
        if (!offer) return res.status(404).json({ error: 'Offer not found' });

        /* Reco Neo4j */
        const session = neo4j.session();
        const cypher  = `
      MATCH (c:City {code: $city})-[:NEAR]->(n:City)
      RETURN n.code AS city ORDER BY n.weight DESC LIMIT 3
    `;
        const result = await session.run(cypher, { city: offer.from });
        await session.close();

        const nearbyCities = result.records.map(r => r.get('city'));
        const related = await Offer.find({ from: { $in: nearbyCities } })
            .limit(3)
            .select('_id')
            .lean();

        offer.relatedOffers = related.map(o => o._id);

        /* Mise en cache 5 min */
        await redis.setEx(
            redisKey,
            300,
            zlib.gzipSync(JSON.stringify(offer)).toString('base64')
        );

        res.json(offer);
    })
);

export default router;
