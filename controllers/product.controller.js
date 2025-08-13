// const db = require('../config/db');
// const cloudinary = require('../config/cloudinary');

// // ✅ Create product — includes logged-in user
// exports.createProduct = async (req, res) => {
//   try {
//     const { title, quantity, price, description } = req.body;
//     const userId = req.user.id; // 👈 Requires auth middleware

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: 'At least one image is required' });
//     }

//     const uploadPromises = req.files.map(file => {
//       return new Promise((resolve, reject) => {
//         const ext = file.originalname.split('.').pop();
//         const publicId = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;

//         const stream = cloudinary.uploader.upload_stream(
//           {
//             folder: 'products',
//             public_id: publicId,
//             resource_type: 'image'
//           },
//           (err, result) => {
//             if (err) reject(err);
//             else resolve(result.secure_url);
//           }
//         );

//         stream.end(file.buffer);
//       });
//     });

//     const imageUrls = await Promise.all(uploadPromises);
//     const imageUrlString = imageUrls.join(',');

//     const sql = `
//       INSERT INTO products (title, quantity, price, description, images, user_id)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;

//     const [result] = await db.query(sql, [title, quantity, price, description, imageUrlString, userId]);

//     return res.status(201).json({
//       message: 'Product created successfully',
//       productId: result.insertId,
//       imageUrls
//     });

//   } catch (error) {
//     console.error('Error creating product:', error);
//     return res.status(500).json({ message: 'Internal server error', error });
//   }
// };

// // ✅ Get products added by logged-in user
// exports.getMyProducts = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const sql = 'SELECT * FROM products WHERE user_id = ?';
//     const [results] = await db.query(sql, [userId]);

//     res.status(200).json(results);
//   } catch (err) {
//     console.error('Error fetching user products:', err);
//     res.status(500).json({ message: 'Error retrieving products', error: err });
//   }
// };

// // 🌐 Keep this public if needed for admin or shop page
// exports.getAllProducts = async (req, res) => {
//   try {
//     const sql = 'SELECT * FROM products';
//     const [results] = await db.query(sql);
//     res.status(200).json(results);
//   } catch (err) {
//     console.error('Error fetching products:', err);
//     res.status(500).json({ message: 'Error retrieving products', error: err });
//   }
// };

// // Get product by ID
// exports.getProductById = async (req, res) => {
//   const productId = req.params.id;

//   try {
//     const sql = 'SELECT * FROM products WHERE id = ?';
//     const [results] = await db.query(sql, [productId]);

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.status(200).json(results[0]);
//   } catch (err) {
//     console.error('Error fetching product:', err);
//     res.status(500).json({ message: 'Error retrieving product', error: err });
//   }
// };

// // Update product
// exports.updateProduct = async (req, res) => {
//   const productId = req.params.id;
//   const { title, quantity, price, description } = req.body;

//   try {
//     let updateFields = [];
//     let updateValues = [];

//     if (title) {
//       updateFields.push('title = ?');
//       updateValues.push(title);
//     }

//     if (quantity) {
//       updateFields.push('quantity = ?');
//       updateValues.push(quantity);
//     }

//     if (price) {
//       updateFields.push('price = ?');
//       updateValues.push(price);
//     }

//     if (description) {
//       updateFields.push('description = ?');
//       updateValues.push(description);
//     }

//     // Upload new images if any
//     if (req.files && req.files.length > 0) {
//       const uploadPromises = req.files.map(file => {
//         return new Promise((resolve, reject) => {
//           const ext = file.originalname.split('.').pop();
//           const publicId = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;

//           const stream = cloudinary.uploader.upload_stream(
//             {
//               folder: 'products',
//               public_id: publicId,
//               resource_type: 'image'
//             },
//             (err, result) => {
//               if (err) reject(err);
//               else resolve(result.secure_url);
//             }
//           );

//           stream.end(file.buffer);
//         });
//       });

//       const newImageUrls = await Promise.all(uploadPromises);
//       updateFields.push('images = ?');
//       updateValues.push(newImageUrls.join(','));
//     }

//     if (updateFields.length === 0) {
//       return res.status(400).json({ message: 'No fields to update' });
//     }

//     const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
//     updateValues.push(productId);

//     const [result] = await db.query(sql, updateValues);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.status(200).json({ message: 'Product updated successfully' });

//   } catch (err) {
//     console.error('Error updating product:', err);
//     res.status(500).json({ message: 'Error updating product', error: err });
//   }
// };

// // Delete product
// exports.deleteProduct = async (req, res) => {
//   const productId = req.params.id;

//   try {
//     const sql = 'DELETE FROM products WHERE id = ?';
//     const [result] = await db.query(sql, [productId]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     res.status(200).json({ message: 'Product deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting product:', err);
//     res.status(500).json({ message: 'Error deleting product', error: err });
//   }
// };
// controllers/product.controller.js
const Product = require('../models/product.model'); // Adjust path if needed
const cloudinary = require('../config/cloudinary'); // Cloudinary config

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        // Upload images to Cloudinary
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file =>
                cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error) {
                        console.error(error);
                        throw new Error('Image upload failed');
                    }
                    return result.secure_url;
                })
            );
            imageUrls = await Promise.all(uploadPromises);
        }

        const newProduct = await Product.create({
            name,
            description,
            price,
            category, // ✅ Save category
            images: imageUrls,
            userId: req.user.id
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating product' });
    }
};

// Get All Products (with optional category filter)
exports.getAllProducts = async (req, res) => {
    try {
        const { category } = req.query;
        let filter = {};

        if (category) {
            filter.category = category;
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// Get My Products
exports.getMyProducts = async (req, res) => {
    try {
        const myProducts = await Product.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(myProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching your products' });
    }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching product' });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Upload new images if provided
        let imageUrls = product.images;
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file =>
                cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error) {
                        console.error(error);
                        throw new Error('Image upload failed');
                    }
                    return result.secure_url;
                })
            );
            imageUrls = await Promise.all(uploadPromises);
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category; // ✅ Update category
        product.images = imageUrls;

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating product' });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await product.deleteOne();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting product' });
    }
};
