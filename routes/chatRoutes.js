// routes/chatgptRoutes.js
const express = require('express');
const router = express.Router();
const {aiMessage,getMessages} = require('../controllers/chatController');

router.post('/chat', aiMessage);
router.get('/messages', getMessages);



module.exports = router;
