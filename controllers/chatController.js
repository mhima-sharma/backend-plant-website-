// controllers/chatgptController.js
const db = require('../config/db');
const generate = require('../config/google');

// Save AI Message
const aiMessage = async (req, res) => {
    try {
        const userMessage = req.body.message;

        // Get AI response
        const botResponse = await generate(userMessage);

        // Save to DB using promise
        const sql = "INSERT INTO messages (user_query, bot_response) VALUES (?, ?)";
        const [result] = await db.query(sql, [userMessage, botResponse]);

        console.log("✅ Message saved to DB:", result.insertId);

        return res.json({
            success: true,
            message: botResponse
        });
    } catch (error) {
        console.error("❌ Error in aiMessage:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Fetch All Messages
const getMessages = async (req, res) => {
    try {
        const sql = "SELECT * FROM messages ORDER BY id DESC";
        const [results] = await db.query(sql);

        return res.json({
            success: true,
            messages: results
        });
    } catch (error) {
        console.error("❌ Failed to fetch messages:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { aiMessage, getMessages };
