const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT secret key - should be in .env in production
const JWT_SECRET = process.env.JWT_SECRET || 'letters-to-al-secret-key';
const SALT_ROUNDS = 10;

// Helper function to get Supabase client when needed
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Check your .env file.');
  }
  
  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw new Error('Failed to initialize Supabase client');
  }
}

/**
 * Register a new user
 * @param {string} username - The user's username
 * @param {string} email - The user's email (optional)
 * @param {string} password - The user's password (to be hashed)
 * @returns {Promise<Object>} - User data or error
 */
async function registerUser(username, email, password) {
  try {
    const supabase = getSupabaseClient();
    
    // Check if username already exists
    const { data: existingUsers } = await supabase
      .from('users')
      .select('username')
      .eq('username', username);
    
    if (existingUsers && existingUsers.length > 0) {
      throw new Error('Username already exists');
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insert the new user
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        { 
          username, 
          email, 
          password_hash: hashedPassword 
        }
      ])
      .select();
    
    if (error) {
      throw error;
    }
    
    if (!user || user.length === 0) {
      throw new Error('Failed to create user');
    }
    
    // Generate JWT token
    const accessToken = jwt.sign({ userId: user[0].id }, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    return {
      id: user[0].id,
      username: user[0].username,
      email: user[0].email,
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login a user
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * @returns {Promise<Object>} - User data with access token or error
 */
async function loginUser(username, password) {
  try {
    const supabase = getSupabaseClient();
    
    // Get user by username
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username);
    
    if (error) {
      throw error;
    }
    
    if (!users || users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    
    // Check password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordValid) {
      throw new Error('Invalid password');
    }
    
    // Generate JWT token
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Logout a user (invalidate their token)
 * @param {string} token - The token to invalidate
 * @returns {Promise<void>}
 */
async function logoutUser(token) {
  // In a real implementation, you might want to add the token to a blacklist
  // or invalidate it in some way. For this simple implementation, we'll
  // just return a successful response.
  return Promise.resolve();
}

/**
 * Verify a token and get user data
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object|null>} - User data or null if invalid
 */
async function verifyToken(token) {
  try {
    const supabase = getSupabaseClient();
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', decoded.userId)
      .single();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken
}; 