const db = require('../config/db'); // Make sure this is your MySQL connection file

// Get all paid orders from view
const getPaidOrders = (req, res) => {
  const sql = "SELECT * FROM paid_orders_view"; // View you created in MySQL

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching paid orders:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
};

module.exports = { getPaidOrders };
