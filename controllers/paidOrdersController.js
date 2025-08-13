const pool = require('../config/db');

const getPaidOrders = (req, res) => {
  pool.query('SELECT * FROM paid_orders', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};
