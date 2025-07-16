import db from '../config/db.js';

// Ensure table exists (run only once)
export const initTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS visitor_counter (
      id INT PRIMARY KEY,
      count BIGINT DEFAULT 0
    );
  `);
  await db.query(`
    INSERT INTO visitor_counter (id, count) VALUES (1, 0)
    ON DUPLICATE KEY UPDATE count = count;
  `);
};

// Increment count
export const incrementVisitor = async (req, res) => {
  try {
    await db.query(`UPDATE visitor_counter SET count = count + 1 WHERE id = 1`);
    res.status(200).json({ message: 'Visitor count incremented' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to increment visitor count' });
  }
};

// Get count
export const getVisitorCount = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT count FROM visitor_counter WHERE id = 1`);
    res.status(200).json({ count: rows[0]?.count || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get visitor count' });
  }
};
