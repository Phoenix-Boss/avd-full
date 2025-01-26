const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');

const generateJWT = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
};

module.exports = { generateJWT };
