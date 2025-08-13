const pool = require('../config/db');

const getPaidOrders = async (req, res) => {
  try {
    // Note: no callback here
    const [rows] = await pool.query('SELECT * FROM paid_orders');
    res.json(rows);
  } catch (err) {
    console.error('DB ERROR:', err.message); // logs exact error
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getPaidOrders };
