import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import redis from '../services/redis.js';
import mongoose from 'mongoose';

// Utilise le modèle User pointant vers la collection "users"
const User = mongoose.model(
  'User',
  new mongoose.Schema({ userId: String }),
  'users'
);

const router = express.Router();

// Route de test GET /login
router.get('/', (req, res) => {
  console.log('GET /login endpoint hit');
  res.json({ ok: 'GET /login is wired up' });
});

// POST /login
router.post('/', async (req, res) => {
  console.log('POST /login invoked with body:', req.body);
  const { userId } = req.body;
  if (!userId) {
    console.log('POST /login missing userId');
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    console.log(`Checking existence of userId: ${userId}`);
    const exists = await User.exists({ userId });
    console.log(`User existence check for '${userId}':`, exists);
    if (!exists) {
      console.log(`POST /login unknown userId: ${userId}`);
      return res.status(401).json({ error: 'Unknown userId' });
    }
  } catch (err) {
    console.error('Mongo error on user lookup:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  const token = uuidv4();
  const expiresIn = 900; // 15 minutes
  console.log(`Generated token ${token} with expiresIn ${expiresIn}s for userId ${userId}`);

  try {
    await redis.set(`session:${token}`, userId, { EX: expiresIn });
    console.log(`Stored session in Redis: session:${token} -> ${userId}`);
    return res.json({ token, expires_in: expiresIn });
  } catch (err) {
    console.error('Redis error on login:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;