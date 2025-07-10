const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ ROUTES

// Create product (authenticated)
router.post('/', authMiddleware, upload.array('images', 5), productController.createProduct);

// Get only products created by the logged-in user (must come before '/:id')
router.get('/my', authMiddleware, productController.getMyProducts);

// Get all products (public)
router.get('/', productController.getAllProducts);

// Get product by ID (public)
router.get('/:id', productController.getProductById);

// Update product (authenticated)
router.put('/products/:id', authMiddleware, upload.array('images', 5), productController.updateProduct);

// Delete product (authenticated)
router.delete('/products/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
