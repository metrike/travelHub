import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
        from: { type: String, required: true },
        to:   { type: String, required: true },
        departDate:  Date,
        returnDate:  Date,
        provider:    String,
        price:       Number,
        currency:    String,
        legs: [{
            flightNum: String,
            dep:       String,
            arr:       String,
            duration:  Number
        }],
        hotel: {
            name:   String,
            nights: Number,
            price:  Number
        },
        activity: {
            title: String,
            price: Number
        }
    },
    { collection: 'offers' });

/* ▸ Index composés «​from-to-price​» */
OfferSchema.index({ from: 1, to: 1, price: 1 });

/* ▸ Index texte sur provider (pour recherche plein-texte) */
OfferSchema.index({ provider: 'text' });

export default mongoose.model('Offer', OfferSchema);
