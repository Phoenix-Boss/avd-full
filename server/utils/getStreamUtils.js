const { StreamClient } = require('@stream-io/node-sdk');
const supabase = require('../config/supabase'); // Supabase client instance
require('dotenv').config(); // Load environment variables

// Stream API keys from the environment variables
const { STREAM_API_KEY, STREAM_API_SECRET_KEY } = process.env;

// Validate that the keys are available
if (!STREAM_API_KEY || !STREAM_API_SECRET_KEY) {
  throw new Error('Stream API keys are not defined in the environment variables.');
}

/**
 * Generate a user token for Stream.
 * @param {string} userId - The ID of the user.
 * @returns {string} - The generated user token.
 */
const generateUserToken = (userId) => {
  try {
    const client = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET_KEY, { timeout: 3000 });
    const token = client.createUserToken(userId); // Correct method for Stream SDK
    return token;
  } catch (error) {
    console.error('Error generating user token:', error.message);
    throw error;
  }
};

/**
 * Fetch the user token for a specific user using their email.
 * @param {string} email - The email of the user.
 * @returns {string} - The Stream user token.
 */
const getUserToken = async (email) => {
  try {
    // Fetch the userId from Supabase's `users` table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error || !data) {
      throw new Error('User not found in Supabase.');
    }

    const userId = data.id; // Get userId (UUID)
    console.log('Fetched userId:', userId);

    // Generate the user token
    const token = generateUserToken(userId);
    return token;
  } catch (error) {
    console.error('Error getting user token:', error.message);
    throw error;
  }
};

module.exports = {
  generateUserToken,
  getUserToken,
};
