const db = require('../config/db');

exports.addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const [existing] = await db.execute(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing.length > 0) {
      await db.execute(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId]
      );
    } else {
      await db.execute(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
    }

    res.status(200).json({ message: 'Product added to cart successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
};
// controllers/cart.controller.js
exports.getCartItems = async (req, res) => {
  const { userId } = req.params;

  try {
    const [items] = await db.execute(`
      SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.images
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);
console.log("hii",items);
    res.status(200).json(items);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching cart items' });
  }
};
