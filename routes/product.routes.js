const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/product.controller');

// ✅ MEMORY STORAGE — DO NOT use diskStorage on Vercel
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ API Endpoints
router.post('/', upload.array('images', 5), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/products/:id', upload.array('images', 5), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;
