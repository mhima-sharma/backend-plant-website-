const app = require('./app'); // Import app from app.js
const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const setupSocket = require('./socket');
const db = require('./config/db'); // 👈 import your DB connection

dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Optional: setup socket
// const io = new Server(server, { cors: { origin: '*' } });
// app.set('io', io);
// setupSocket(io);

// ✅ Start the server and test DB connection
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    const [rows] = await db.query('SELECT 1');
    console.log('✅ MySQL (TiDB) connected:', rows);
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
});
