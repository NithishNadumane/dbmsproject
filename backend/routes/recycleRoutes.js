const express = require('express');
const router = express.Router();
const pool = require('../db');

// 📦 Request Pickup
router.post('/request-pickup', async (req, res) => {
  const { user_email, waste_type, area } = req.body;
  try {
    await pool.query(
      'INSERT INTO recycle_requests (user_email, waste_type, area) VALUES ($1, $2, $3)',
      [user_email, waste_type, area]
    );
    res.json({ message: 'Pickup requested!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Request failed' });
  }
});

// 📜 Get Status + History
router.get('/my-requests', async (req, res) => {
  const { user_email } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM recycle_requests WHERE user_email = $1 ORDER BY requested_at DESC',
      [user_email]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch data' });
  }
});

// 🧹 Admin Dashboard (Optional)
router.get('/admin/requests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recycle_requests ORDER BY requested_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch requests' });
  }
});

// Update request status (Admin)
router.put('/admin/update-status', async (req, res) => {
  const { id, status } = req.body;
  try {
    await pool.query(
      'UPDATE recycle_requests SET status = $1 WHERE id = $2',
      [status, id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
