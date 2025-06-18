// routes/metrics.js
import express from 'express';
import { register } from '../services/metrics.js';

const router = express.Router();

router.get('/', async (_, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

export default router;
