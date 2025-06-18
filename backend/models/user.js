import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: String,
    name: String,
    email: String,
    homeCity: String,
    preferredDestinations: [String]
}, { collection: 'users' });

export default mongoose.model('User', userSchema);
