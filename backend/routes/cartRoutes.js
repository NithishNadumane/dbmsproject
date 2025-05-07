const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/add-to-cart
router.post('/add-to-cart', async (req, res) => {
  try {
    const { user_email, product_id, quantity, product_name } = req.body;

    const checkStock = await pool.query('SELECT stock FROM product WHERE id = $1', [product_id]);
    if (checkStock.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentStock = checkStock.rows[0].stock;
    if (currentStock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    const existing = await pool.query(
      'SELECT * FROM cart WHERE user_email = $1 AND product_id = $2',
      [user_email, product_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE user_email = $2 AND product_id = $3',
        [quantity, user_email, product_id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (user_email, product_id, product_name, quantity) VALUES ($1, $2, $3, $4)',
        [user_email, product_id, product_name, quantity]
      );
    }

    // Reduce product stock
    await pool.query(
      'UPDATE product SET stock = stock - $1 WHERE id = $2',
      [quantity, product_id]
    );

    res.json({ message: 'Product added to cart and stock updated' });
  } catch (err) {
    console.error('Error in add-to-cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET /api/cart?user_email=someone@example.com
router.get('/cart', async (req, res) => {
  const { user_email } = req.query;

  if (!user_email) {
    return res.status(400).json({ error: 'Missing user email' });
  }

  try {
    const result = await pool.query(
      `SELECT c.product_id, p.name, p.description, p.price, p.image_url, c.quantity
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


// DELETE /api/cart/remove
router.post('/cart/remove', async (req, res) => {
  const { user_email } = req.body;
  const item_id = parseInt(req.body.item_id, 10); // Ensure it's an integer

  if (!user_email || isNaN(item_id)) {
    return res.status(400).json({ success: false, message: 'Missing or invalid user_email or item_id' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if the cart item exists
    const qtyResult = await client.query(
      'SELECT quantity FROM cart WHERE user_email = $1 AND product_id = $2',
      [user_email, item_id]
    );

    if (qtyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    const quantity = qtyResult.rows[0].quantity;

    // Restore stock
    await client.query(
      'UPDATE product SET stock = stock + $1 WHERE id = $2',
      [quantity, item_id]
    );

    // Remove item from cart
    await client.query(
      'DELETE FROM cart WHERE user_email = $1 AND product_id = $2',
      [user_email, item_id]
    );

    await client.query('COMMIT');
    res.json({ success: true });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error removing cart item:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
});



// POST /api/cart/placeOrder
router.post('/cart/placeOrder', async (req, res) => {
  const { user_email } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM cart WHERE user_email = $1',
      [user_email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // OPTIONAL: Store order somewhere (like `orders` table) before deleting
    // This example just clears the cart for simplicity

    await pool.query(
      'DELETE FROM cart WHERE user_email = $1',
      [user_email]
    );

    res.json({ success: true, message: 'Order placed and cart cleared' });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

module.exports = router;
