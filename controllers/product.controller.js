// controllers/product.controller.js
const db = require('../config/db');
const path = require('path');

// Create product
exports.createProduct = (req, res) => {
  try {
    const { title, quantity, price, description } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const imageFilenames = req.files.map(file => file.filename).join(',');

    const sql = `
      INSERT INTO products (title, quantity, price, description, images)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [title, quantity, price, description, imageFilenames], (err, result) => {
      if (err) {
        console.error('Error inserting product:', err);
        return res.status(500).json({ message: 'Error creating product', error: err });
      }

      return res.status(201).json({
        message: 'Product created successfully',
        productId: result.insertId,
      });
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ message: 'Unexpected server error', error });
  }
};

// Get all products
// Get all products - FIXED for mysql2 promise client
exports.getAllProducts = async (req, res) => {
  console.log("product list api");
  const sql = 'SELECT * FROM products';

  try {
    // Run query using await
    const [results] = await db.query(sql);
    
    console.log("Fetched products: ", results);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error retrieving products', error: err });
  }
};


// Delete product









exports.deleteProduct = (req, res) => {
  const productId = req.params.id;

  const query = 'DELETE FROM products WHERE id = ?';

  db.query(query, [productId], (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  });
};

// Get product detail by id
exports.getProductById = async (req, res) => {
  const productId = req.params.id;

  const sql = 'SELECT * FROM products WHERE id = ?';

  try {
    const [results] = await db.query(sql, [productId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Error retrieving product', error: err });
  }
};
