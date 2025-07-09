const multer = require('multer');

// ✅ Use memory storage for Cloudinary (required for Vercel)
const storage = multer.memoryStorage();
const upload = multer({ storage }); // No disk writes

const router = require('express').Router();
const productController = require('../controllers/product.controller');

// Routes
router.post('/', upload.array('images', 5), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/products/:id', upload.array('images', 5), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;
