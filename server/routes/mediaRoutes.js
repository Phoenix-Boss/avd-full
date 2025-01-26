const express = require('express');
const { uploadMedia, getMedia } = require('../controllers/mediaController');
const router = express.Router();

router.post('/upload', uploadMedia);
router.get('/:id', getMedia);

module.exports = router;
