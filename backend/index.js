import express from 'express';
import cors from 'cors';
import mongoose from './services/mongo.js';
import authRoute from './routes/auth.js';
import offersRoute from './routes/offers.js';
import recoRoute from './routes/reco.js';
import './init-neo4j.js';
import statsRoute from './routes/stats.js';
import metricsRouter from './routes/metrics.js';
const app = express();

app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
    console.log('Ping received');
    res.send('pong');
});

mongoose.connection.on('error', (err) => {
    console.error(' MongoDB connection error:', err.message);
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected (waiting to be ready)');
});

const startServer = async () => {
    try {
        console.log('Waiting for MongoDB to be ready...');
        await mongoose.connection.asPromise();
        console.log('All services ready - Starting Express...');
        app.listen(8000, '0.0.0.0', () => {
            console.log('API server listening on port 8000');
            console.log('Test with: curl http://localhost:8000/ping');
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

app.use('/login', authRoute);
app.use('/offers', offersRoute);
app.use('/reco', recoRoute);

app.use('/stats', statsRoute);
app.use('/metrics', metricsRouter); // ⬅️ Ajout ici


startServer();