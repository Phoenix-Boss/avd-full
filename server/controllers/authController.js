const supabase = require("../config/database");

/**
 * Fetch all users from the database.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the 'users' table
    const { data: users, error } = await supabase.from("users").select("*");

    if (error) {
      return res
        .status(500)
        .json({ error: "Failed to fetch users", details: error.message });
    }

    res.json({ users }); // Respond with the list of users
  } catch (error) {
    console.error("Error fetching all users:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch users", details: error.message });
  }
};

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
        .from("users")
        .select("*")
        .eq("phone_number", phoneNumber)
        .single();
    }
    // Login by email and password
    else if (email && password) {
      query = supabase.from("users").select("*").eq("email", email).single();
    } else {
      return res
        .status(400)
        .json({ error: "Phone number or email and password must be provided" });
    }

    const { data: user, error } = await query;

    if (error || !user) {
      return res
        .status(404)
        .json({ error: "User not found or invalid credentials" });
    }

    // Optionally validate password (assuming passwords are hashed)
    if (password && user.encrypted_password) {
      const isPasswordValid = validatePassword(
        password,
        user.encrypted_password
      ); // Add password validation logic
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
    }

    // Return user data
    res.json({ user });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ error: "Failed to log in", details: error.message });
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
      return res
        .status(400)
        .json({ error: "Email or phone number is required" });
    }

    // Fetch user from Supabase
    const query = supabase.from("users").select("*").limit(1);
    if (email) {
      query.eq("email", email);
    } else if (phone) {
      query.eq("phone_number", phone);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user }); // Respond with user details
  } catch (error) {
    console.error("Error fetching current user:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch current user", details: error.message });
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
  const bcrypt = require("bcrypt");
  return bcrypt.compareSync(password, encryptedPassword);
};

/**
 * Fetch users the current user is following.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
const getUserFollowing = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const { data: following, error } = await supabase
      .from("follows")
      .select("*, users!follows_following_id_fkey(*)")
      .eq("follower_id", userId);

    if (error) {
      console.error("Supabase error:", error);
      return res
        .status(500)
        .json({
          error: "Failed to fetch following list",
          details: error.message,
        });
    }

    res.json({ following });
  } catch (error) {
    console.error("Server error:", error.message);
    res
      .status(500)
      .json({
        error: "Failed to fetch following list",
        details: error.message,
      });
  }
};

/**
 * Fetch users following the current user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
const getUserFollowers = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Fetch the list of users following the current user
    const { data: followers, error } = await supabase
      .from("follows")
      .select("*, users!follows_follower_id_fkey(*)")
      .eq("following_id", userId);

    if (error) {
      return res
        .status(500)
        .json({
          error: "Failed to fetch followers list",
          details: error.message,
        });
    }

    res.json({ followers });
  } catch (error) {
    console.error("Error fetching followers list:", error.message);
    res
      .status(500)
      .json({
        error: "Failed to fetch followers list",
        details: error.message,
      });
  }
};

module.exports = {
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserFollowing,
  getUserFollowers,
};
