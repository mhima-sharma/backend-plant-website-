// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// 🔹 Define CORS settings once
const corsOptions = {
  origin: [
    "https://plant-website-frontend-beryl.vercel.app", // Frontend on Vercel
    "http://localhost:4200" // Local dev
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// 🔹 Apply CORS to all requests
app.use(cors(corsOptions));

// 🔹 Handle preflight requests with same config
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Static files
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

app.get("/", (req, res) => {
  res.send("Backend API is working ✅");
});

module.exports = app;
