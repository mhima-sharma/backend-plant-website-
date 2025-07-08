const db = require('../config/db');
const path = require('path');

// Create product
exports.createProduct = async (req, res) => {
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

    const [result] = await db.query(sql, [title, quantity, price, description, imageFilenames]);

    return res.status(201).json({
      message: 'Product created successfully',
      productId: result.insertId,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ message: 'Unexpected server error', error });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  console.log("product list api");
  const sql = 'SELECT * FROM products';

  try {
    const [results] = await db.query(sql);
    console.log("Fetched products: ", results);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error retrieving products', error: err });
  }
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

// Update product
exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { title, quantity, price, description } = req.body;

  try {
    // If images are provided in the request
    let updateFields = [];
    let updateValues = [];

    if (title) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }

    if (quantity) {
      updateFields.push('quantity = ?');
      updateValues.push(quantity);
    }

    if (price) {
      updateFields.push('price = ?');
      updateValues.push(price);
    }

    if (description) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (req.files && req.files.length > 0) {
      const imageFilenames = req.files.map(file => file.filename).join(',');
      updateFields.push('images = ?');
      updateValues.push(imageFilenames);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(productId);

    const [result] = await db.query(sql, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully' });

  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Error updating product', error: err });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const sql = 'DELETE FROM products WHERE id = ?';
    const [result] = await db.query(sql, [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Error deleting product', error: err });
  }
};
