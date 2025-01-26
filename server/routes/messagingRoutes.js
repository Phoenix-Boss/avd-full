const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messagingController');
const router = express.Router();

router.post('/send', sendMessage);
router.get('/history', getMessages);

module.exports = router;
