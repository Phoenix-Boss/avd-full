const express = require('express');
const {
    loginUser,
    getCurrentUser,
    getAllUsers,
    getUserFollowing,
    getUserFollowers,
} = require('../controllers/authController');
const router = express.Router();

router.post('/login', loginUser);
router.get('/current-user', getCurrentUser);
router.get('/users', getAllUsers);
router.get('/users/:userId/following', getUserFollowing);
router.get('/users/:userId/followers', getUserFollowers);


module.exports = router;
