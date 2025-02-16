require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    ZEGOCLOUD_APP_ID: parseInt(process.env.ZEGOCLOUD_APP_ID, 10),
    ZEGOCLOUD_SERVER_SECRET: process.env.ZEGOCLOUD_SERVER_SECRET,
};