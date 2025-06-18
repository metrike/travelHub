import mongoose from './mongo.js';

const offerSchema = new mongoose.Schema({}, { strict: false });
const Offer = mongoose.model('Offer', offerSchema, 'travel');

export const getOffersFromMongo = async (from, to, limit) => {
    return Offer.find({ from, to }).sort({ price: 1 }).limit(limit);
};
