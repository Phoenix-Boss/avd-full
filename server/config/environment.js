require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    STREAM_API_KEY: process.env.STREAM_API_KEY,
    STREAM_API_SECRET_KEY: process.env.STREAM_API_SECRET_KEY,
};
