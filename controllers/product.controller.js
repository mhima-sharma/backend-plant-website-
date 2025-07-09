const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { title, quantity, price, description } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Upload images to Cloudinary and get URLs
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'products' }, (err, result) => {
          if (err) reject(err);
          else resolve(result.secure_url);
        });
        stream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);
    const imageUrlString = imageUrls.join(','); // Save as comma-separated string

    const sql = `
      INSERT INTO products (title, quantity, price, description, images)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [title, quantity, price, description, imageUrlString]);

    return res.status(201).json({
      message: 'Product created successfully',
      productId: result.insertId,
      imageUrls
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const sql = 'SELECT * FROM products';
    const [results] = await db.query(sql);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error retrieving products', error: err });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  const productId = req.params.id;

  try {
    const sql = 'SELECT * FROM products WHERE id = ?';
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

    // Upload new images if any
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'products' }, (err, result) => {
            if (err) reject(err);
            else resolve(result.secure_url);
          });
          stream.end(file.buffer);
        });
      });

      const newImageUrls = await Promise.all(uploadPromises);
      updateFields.push('images = ?');
      updateValues.push(newImageUrls.join(','));
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
