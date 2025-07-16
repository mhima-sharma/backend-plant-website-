const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Existing Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const messageRoutes = require('./routes/user');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatgptRoutes = require('./routes/chatRoutes');

// ✅ New Visitor Routes
const visitorRoutes = require('./routes/visitorRoutes');
const { initVisitorTable } = require('./controllers/visitorController');

// Route Mapping
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', orderRoutes);
app.use('/api/ai', chatgptRoutes);
app.use('/api/visitor', visitorRoutes); // ✅ Added visitor route

// Test route
app.get("/", (req, res) => {
  res.send("🌱 Backend API is working ✅");
});

// ✅ Initialize visitor table on startup
initVisitorTable().then(() => {
  console.log('✅ Visitor counter table ready');
}).catch((err) => {
  console.error('❌ Failed to initialize visitor table:', err);
});

module.exports = app;
