const app = require('./app'); // Import app from app.js
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀Server running on port ${PORT}`);
  console.log(`💡MY SQL is connected `);
});
