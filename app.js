// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

// ✅ CORS Configuration (minimal change)
const allowedOrigins = ['https://plant-website-frontend-beryl.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Allow preflight requests (for POST/PUT/DELETE etc.)
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const messageRoutes = require('./routes/user');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatgptRoutes = require('./routes/chatRoutes');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', orderRoutes);
app.use('/api/ai', chatgptRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Backend API is working ✅");
});

module.exports = app;
