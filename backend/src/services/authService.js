const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY env variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Register a new user
 * @param {string} username - The user's username
 * @param {string} email - The user's email (optional)
 * @param {string} password - The user's password (to be hashed)
 * @returns {Promise<Object>} - User data or error
 */
async function registerUser(username, email, password) {
  try {
    // Call the Supabase function we created to register a user
    const { data, error } = await supabase.rpc('create_user', {
      username,
      email,
      password
    });

    if (error) throw error;

    // Create a JWT token using the session
    const { data: tokenData, error: tokenError } = await supabase.auth.signUp({
      email: email || `${username}@lettertoal.fake`, // Use real email or generate a fake one
      password: password,
      options: {
        data: {
          username,
          user_id: data // Pass the user ID from our custom function
        }
      }
    });

    if (tokenError) throw tokenError;

    return {
      id: data,
      username,
      email,
      accessToken: tokenData?.session?.access_token
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * Login a user
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * @returns {Promise<Object>} - User data and tokens or error
 */
async function loginUser(username, password) {
  try {
    // First authenticate the user with our custom function
    const { data, error } = await supabase.rpc('authenticate_user', {
      input_username: username,
      input_password: password
    });

    if (error || !data.length) {
      throw new Error('Invalid credentials');
    }

    // User is authenticated, now get the email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', data[0].id)
      .single();

    if (userError) throw userError;

    // Generate a session
    const { data: tokenData, error: tokenError } = await supabase.auth.signInWithPassword({
      email: userData.email || `${username}@lettertoal.fake`,
      password
    });

    if (tokenError) throw tokenError;

    return {
      id: data[0].id,
      username: data[0].username,
      accessToken: tokenData?.session?.access_token,
      refreshToken: tokenData?.session?.refresh_token
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

/**
 * Logout a user by invalidating their token
 * @param {string} token - The user's access token
 * @returns {Promise<boolean>} - Success status
 */
async function logoutUser(token) {
  try {
    // Set the auth token in the client
    supabase.auth.setAuth(token);
    
    // Sign out
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error logging out user:', error);
    throw error;
  }
}

/**
 * Verify a user's token
 * @param {string} token - The user's access token
 * @returns {Promise<Object>} - User data or null
 */
async function verifyToken(token) {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) return null;
    
    return {
      id: data.user.id,
      username: data.user.user_metadata.username,
      email: data.user.email
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken
}; 