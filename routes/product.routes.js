const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/product.controller');

// Use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.array('images', 5), productController.createProduct);
router.get('/', productController.getAllProducts);
router.put('/products/:id', upload.array('images'), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.get('/:id', productController.getProductById);

module.exports = router;
