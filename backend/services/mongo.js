import mongoose from 'mongoose';

mongoose.connect('mongodb://mongo:27017/projet', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

db.once('open', () => {
    console.log('✅ MongoDB connected');
});

export default mongoose;
