// controllers/product.controller.js
const db = require('../config/db');
const path = require('path');

exports.createProduct = (req, res) => {
  try {
    const { title, quantity, price, description } = req.body;

    // Ensure files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Get filenames of uploaded images
    const imageFilenames = req.files.map(file => file.filename).join(',');

    // SQL Insert
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


// exports.getAllProducts = (req, res) => {
//   const sql = 'SELECT * FROM products';

//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error('Error fetching products:', err);
//       return res.status(500).json({ message: 'Error retrieving products', error: err });
//     }

//     res.status(200).json(results);
//   });
// };


exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Database error', error: err });
  }
}




// controllers/product.controller.js
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


// get product detail by id
exports.getProductById = async (req, res) => {
  const productId = req.params.id;

  try {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};