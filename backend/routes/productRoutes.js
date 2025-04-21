const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/products', async (req, res) => {
  const { category } = req.query;
  try {
    let query = 'SELECT * FROM product';
    const values = [];

    if (category && category !== 'All') {
      query += ' WHERE category = $1';
      values.push(category);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
