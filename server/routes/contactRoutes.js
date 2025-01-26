const express = require('express');
const { syncContacts, blockContact } = require('../controllers/contactController');
const router = express.Router();

router.post('/sync', syncContacts);
router.post('/block', blockContact);

module.exports = router;
