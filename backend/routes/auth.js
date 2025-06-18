import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import redis from '../services/redis.js';

const router = express.Router();

// POST /login
router.post('/', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const token = uuidv4();
  const expiresIn = 900; // 15 minutes

  try {
    await redis.set(`session:${token}`, userId, { EX: expiresIn });
    return res.json({ token, expires_in: expiresIn });
  } catch (err) {
    console.error('Redis error on login:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
