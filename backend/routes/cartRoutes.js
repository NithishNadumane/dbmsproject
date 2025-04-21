const express = require('express');
const router = express.Router();
const pool = require('../db');

// Add to cart
router.post('/add-to-cart', async (req, res) => {
  const { user_email, product_id, quantity } = req.body;

  if (!user_email || !product_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if product already exists in cart
    const existing = await pool.query(
      'SELECT * FROM cart WHERE user_email = $1 AND product_id = $2',
      [user_email, product_id]
    );

    if (existing.rows.length > 0) {
      // Update quantity if already in cart
      await pool.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE user_email = $2 AND product_id = $3',
        [quantity || 1, user_email, product_id]
      );
    } else {
      // Insert new cart item
      await pool.query(
        'INSERT INTO cart (user_email, product_id, quantity) VALUES ($1, $2, $3)',
        [user_email, product_id, quantity || 1]
      );
    }

    res.json({ message: 'Product added to cart!' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Get cart items by email
router.get('/cart', async (req, res) => {
  const { user_email } = req.query;

  if (!user_email) {
    return res.status(400).json({ error: 'Missing user email' });
  }

  try {
    const result = await pool.query(
      `SELECT c.id, p.name, p.description, p.price, p.image_url, c.quantity
       FROM cart c
       JOIN product p ON c.product_id = p.id
       WHERE c.user_email = $1`,
      [user_email]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ error: 'Failed to load cart' });
  }
});

module.exports = router;
