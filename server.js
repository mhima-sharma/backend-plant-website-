const app = require('./app'); // Import app from app.js
const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const setupSocket = require('./socket');

dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: { origin: '*' }
});
app.set('io', io); // optional if needed in app.js
setupSocket(io);

// ✅ Start the HTTP server, not just the Express app
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💡 MY SQL is connected`);
});
