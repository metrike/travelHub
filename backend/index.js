import express from 'express';
import cors from 'cors';
import mongoose from './services/mongo.js';
import offersRoute from './routes/offers.js';

const app = express();

// Middleware de base
app.use(cors());
app.use(express.json());

// Route de santé immédiate
app.get('/ping', (req, res) => {
    console.log('🏓 Ping received');
    res.send('pong');
});

// Configuration des événements MongoDB
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('connected', () => {
    console.log('📡 MongoDB connected (waiting to be ready)');
});

// Attendre que tous les services soient prêts
const startServer = async () => {
    try {
        console.log('⏳ Waiting for MongoDB to be ready...');
        await mongoose.connection.asPromise(); // Nouvelle méthode depuis Mongoose 7

        console.log('🚀 All services ready - Starting Express...');
        app.listen(8000, '0.0.0.0', () => {
            console.log('✅ API server listening on port 8000');
            console.log('🔗 Test with: curl http://localhost:8000/ping');
        });

    } catch (err) {
        console.error('💥 Failed to start server:', err);
        process.exit(1);
    }
};

// Routes API (après l'initialisation)
app.use('/api', offersRoute);

// Démarrer l'application
startServer();