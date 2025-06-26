const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/users', async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, name, email FROM users');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// GET /api/messages/:roomId
router.get('/:roomId', async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const [messages] = await db.query(
      'SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC',
      [roomId]
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
