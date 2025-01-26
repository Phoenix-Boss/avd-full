const { StreamClient } = require('@stream-io/node-sdk');
const { STREAM_API_KEY, STREAM_API_SECRET_KEY } = require('../config/environment');

/**
 * Generate a user token.
 * @param {string} userId - The ID of the user.
 * @returns {string} - The user token.
 */
const generateUserToken = (userId) => {
  try {
    const client = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET_KEY, { timeout: 3000 });
    const token = client.generateUserToken({ user_id: userId });
    return token;
  } catch (error) {
    console.error("Error generating user token:", error);
    throw error;
  }
};

module.exports = { generateUserToken };