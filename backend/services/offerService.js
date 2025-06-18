import Offer from '../models/offer.js';

/**
 * Récupère les offres depuis MongoDB, triées par prix croissant.
 *
 * @param {String} from   – code IATA de départ (ex. "PAR")
 * @param {String} to     – code IATA d’arrivée (ex. "TYO")
 * @param {Number} limit  – nombre maximal de documents à renvoyer
 */
export async function getOffersFromMongo(from, to, limit = 10, q = '') {
    const filter = {
        from,
        to,
    };

    if (q && q.trim()) {
        filter.$text = { $search: q };
    }

    return Offer.find(filter)
        .sort(q ? {score: {$meta: "textScore"}} : {})
        .limit(limit)
        .lean();
}

