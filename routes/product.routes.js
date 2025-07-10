const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/authMiddleware'); // ✅ middleware to verify token

// ✅ MEMORY STORAGE — DO NOT use diskStorage on Vercel
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ API Endpoints

// Create product (authenticated)
router.post('/', authMiddleware, upload.array('images', 5), productController.createProduct);

// Get all products (public or admin)
router.get('/', productController.getAllProducts);

// Get only products created by the logged-in user
router.get('/my', authMiddleware, productController.getMyProducts); // ✅ NEW

// Get product by ID (public)
router.get('/:id', productController.getProductById);

// Update product (authenticated)
router.put('/products/:id', authMiddleware, upload.array('images', 5), productController.updateProduct);

// Delete product (authenticated)
router.delete('/products/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
