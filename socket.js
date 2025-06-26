const db = require('./config/db');
const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // ==== ONLINE USER REGISTRATION ====
    socket.on("userOnline", (username) => {
      if (!username) return;
      onlineUsers.set(username, socket.id);
      console.log(`👤 User online: ${username}`);
      io.emit("onlineUsers", [...onlineUsers.keys()]);
    });

    // ==== DISCONNECT ====
    socket.on("disconnect", () => {
      for (const [user, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          console.log(`❌ User disconnected: ${user}`);
          onlineUsers.delete(user);
          break;
        }
      }
      io.emit("onlineUsers", [...onlineUsers.keys()]);
    });

    // === ONE-TO-ONE CHAT JOIN ===
    socket.on("join", (roomId) => {
      socket.join(roomId);
      console.log(`📥 Socket ${socket.id} joined room: ${roomId}`);

      const query = "SELECT id, sender, message, created_at, isEdited FROM messages WHERE room_id = ?";
      db.query(query, [roomId], (err, results) => {
        if (err) return console.error("❌ MySQL Error on join:", err);

        const formatted = results.map(row => ({
          ...row,
          isEdited: !!row.isEdited
        }));
        console.log(`📨 Sending previous messages to room ${roomId}`);
        socket.emit("receiveMessage", formatted);
      });
    });

    // === ONE-TO-ONE SEND MESSAGE ===
    socket.on("sendMessage", ({ roomId, sender, message }) => {
      console.log(`✉️ ${sender} is sending message to ${roomId}: "${message}"`);
      const insertQuery = "INSERT INTO messages (room_id, sender, message) VALUES (?, ?, ?)";
      db.query(insertQuery, [roomId, sender, message], (err, result) => {
        if (err) return console.error("❌ MySQL Error on sendMessage:", err);

        const selectQuery = "SELECT id, sender, message, created_at, isEdited FROM messages WHERE id = LAST_INSERT_ID()";
        db.query(selectQuery, (err, results) => {
          if (err) return console.error("❌ MySQL Error fetching message after insert:", err);

          const message = {
            ...results[0],
            isEdited: !!results[0].isEdited
          };
          io.to(roomId).emit("receiveMessage", message);
          console.log(`✅ Message delivered to room ${roomId}`);
        });
      });
    });

    // === GROUP CHAT JOIN ===
    socket.on("joinGroupRoom", ({ groupId, username }) => {
      if (!groupId || !username) return;

      const checkQuery = "SELECT * FROM group_members WHERE group_id = ? AND username = ?";
      db.query(checkQuery, [groupId, username], (err, results) => {
        if (err) return console.error("❌ MySQL error on joinGroupRoom:", err);
        if (results.length === 0) {
          console.log(`❌ Unauthorized group join attempt by ${username} for group ${groupId}`);
          return socket.emit("unauthorized");
        }

        const roomId = `group_${groupId}`;
        socket.join(roomId);
        console.log(`👥 ${username} joined group room: ${roomId}`);

        const fetchQuery = "SELECT id, sender, message, created_at, isEdited FROM messages WHERE room_id = ?";
        db.query(fetchQuery, [roomId], (err, messages) => {
          if (err) return console.error("❌ MySQL error fetching group messages:", err);

          const formatted = messages.map(msg => ({
            ...msg,
            isEdited: !!msg.isEdited
          }));
          socket.emit("receiveMessage", formatted);
        });
      });
    });

    // === GROUP SEND MESSAGE ===
    socket.on("sendGroupMessage", ({ groupId, sender, message }) => {
      if (!groupId || !sender || !message) return;

      const roomId = `group_${groupId}`;
      console.log(`📨 ${sender} is sending message to group ${groupId}: "${message}"`);
      const insertQuery = "INSERT INTO messages (room_id, sender, message) VALUES (?, ?, ?)";
      db.query(insertQuery, [roomId, sender, message], (err, result) => {
        if (err) return console.error("❌ MySQL error sending group message:", err);

        const selectQuery = "SELECT id, sender, message, created_at, isEdited FROM messages WHERE id = LAST_INSERT_ID()";
        db.query(selectQuery, (err, results) => {
          if (err) return console.error("❌ MySQL error fetching inserted group message:", err);

          const message = {
            ...results[0],
            isEdited: !!results[0].isEdited
          };
          // Uncomment the line below if you want to broadcast the message
          // io.to(roomId).emit("receiveMessage", message);
          console.log(`✅ Group message delivered to room ${roomId}`);
        });
      });
    });

  });
};
