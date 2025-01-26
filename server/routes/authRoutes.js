const express = require('express');
const { loginUser, getCurrentUser } = require('../controllers/authController');
const router = express.Router();

// router.post('/register', registerUser);
router.post('/login', loginUser);
// Get Current User Route
router.get('/current-user', getCurrentUser);


module.exports = router;
