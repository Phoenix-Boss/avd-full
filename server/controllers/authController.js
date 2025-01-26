// const supabase = require('../config/database');

// const registerUser = async (req, res) => {
//     const { phoneNumber, displayName } = req.body;

//     const { data, error } = await supabase
//         .from('users')
//         .insert([{ phone_number: phoneNumber, display_name: displayName }])
//         .select();

//     if (error) return res.status(400).json({ error: 'User registration failed', details: error.message });
//     res.status(201).json({ user: data[0] });
// };

// const loginUser = async (req, res) => {
//     const { phoneNumber } = req.body;

//     const { data, error } = await supabase
//         .from('users')
//         .select('*')
//         .eq('phone_number', phoneNumber)
//         .single();

//     if (error || !data) return res.status(404).json({ error: 'User not found' });
//     res.json({ user: data });
// };

// module.exports = { registerUser, loginUser };

const supabase = require('../config/database');

/**
 * Log in a user using phone number or email and password.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
const loginUser = async (req, res) => {
    const { phoneNumber, email, password } = req.body;

    try {
        let query;

        // Login by phone number
        if (phoneNumber) {
            query = supabase
                .from('users')
                .select('*')
                .eq('phone_number', phoneNumber)
                .single();
        }
        // Login by email and password
        else if (email && password) {
            query = supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
        } else {
            return res.status(400).json({ error: 'Phone number or email and password must be provided' });
        }

        const { data: user, error } = await query;

        if (error || !user) {
            return res.status(404).json({ error: 'User not found or invalid credentials' });
        }

        // Optionally validate password (assuming passwords are hashed)
        if (password && user.encrypted_password) {
            const isPasswordValid = validatePassword(password, user.encrypted_password); // Add password validation logic
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
        }

        // Return user data
        res.json({ user });
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).json({ error: 'Failed to log in', details: error.message });
    }
};

/**
 * Get the current logged-in user details.
 * Expects a query parameter `email` or `phone` to identify the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
const getCurrentUser = async (req, res) => {
    const { email, phone } = req.query;

    try {
        if (!email && !phone) {
            return res.status(400).json({ error: 'Email or phone number is required' });
        }

        // Fetch user from Supabase
        const query = supabase.from('users').select('*').limit(1);
        if (email) {
            query.eq('email', email);
        } else if (phone) {
            query.eq('phone_number', phone);
        }

        const { data: user, error } = await query.single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user }); // Respond with user details
    } catch (error) {
        console.error('Error fetching current user:', error.message);
        res.status(500).json({ error: 'Failed to fetch current user', details: error.message });
    }
};

/**
 * Validate the provided password against the stored encrypted password.
 * @param {string} password - The plain text password.
 * @param {string} encryptedPassword - The hashed password stored in the database.
 * @returns {boolean} - Returns true if the password is valid, otherwise false.
 */
const validatePassword = (password, encryptedPassword) => {
    // Implement password validation (e.g., using bcrypt)
    const bcrypt = require('bcrypt');
    return bcrypt.compareSync(password, encryptedPassword);
};

module.exports = { loginUser, getCurrentUser };
