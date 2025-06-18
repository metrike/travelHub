import Offer from '../models/offer.js';

/**
 * Récupère les offres depuis MongoDB, triées par prix croissant.
 *
 * @param {String} from   – code IATA de départ (ex. "PAR")
 * @param {String} to     – code IATA d’arrivée (ex. "TYO")
 * @param {Number} limit  – nombre maximal de documents à renvoyer
 */
export const getOffersFromMongo = (from, to, limit) => {
    return Offer.find({ from, to })
        .sort({ price: 1 })
        .limit(limit)
        .lean();         // on renvoie directement des JSON “plats”
};
