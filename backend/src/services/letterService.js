const { createClient } = require('@supabase/supabase-js');

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
 * Create a new letter
 * @param {Object} letterData - The letter data
 * @param {string} letterData.content - The letter content
 * @param {boolean} letterData.isAnonymous - Whether the letter is anonymous
 * @param {string} letterData.userId - The user ID (if not anonymous)
 * @param {Array} letterData.embedding - The emotional embedding vector (optional)
 * @returns {Promise<Object>} - Letter data or error
 */
async function createLetter(letterData) {
  try {
    const supabase = getSupabaseClient();
    
    const { content, isAnonymous, userId, embedding } = letterData;
    
    const letterRecord = {
      content,
      is_anonymous: isAnonymous,
      user_id: isAnonymous ? null : userId
    }
    
    // Add embedding if provided
    if (embedding) {
      letterRecord.emotional_vector = embedding;
    }
    
    const { data, error } = await supabase
      .from('letters')
      .insert([letterRecord])
      .select();
    
    if (error) {
      throw error;
    }
    
    // Fetch username if letter is not anonymous and has a user_id
    let username = null;
    if (!isAnonymous && userId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .single();
      
      if (!userError && userData) {
        username = userData.username;
      }
    }
    
    return {
      id: data[0].id,
      content: data[0].content,
      isAnonymous: data[0].is_anonymous,
      userId: data[0].user_id,
      username,
      createdAt: data[0].created_at,
      embedding: data[0].emotional_vector
    };
  } catch (error) {
    console.error('Error creating letter:', error);
    throw error;
  }
}

/**
 * Get all letters
 * @returns {Promise<Array>} - Array of letters or error
 */
async function getAllLetters() {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('letters')
      .select(`
        id,
        content,
        is_anonymous,
        user_id,
        created_at,
        emotional_vector,
        users (
          username
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(letter => ({
      id: letter.id,
      content: letter.content,
      isAnonymous: letter.is_anonymous,
      userId: letter.user_id,
      username: letter.is_anonymous ? 'Anonymous' : letter.users?.username,
      createdAt: letter.created_at,
      embedding: letter.emotional_vector
    }));
  } catch (error) {
    console.error('Error getting all letters:', error);
    throw error;
  }
}

/**
 * Get a letter by ID
 * @param {string} id - The letter ID
 * @returns {Promise<Object>} - Letter data or error
 */
async function getLetterById(id) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('letters')
      .select(`
        id,
        content,
        is_anonymous,
        user_id,
        created_at,
        emotional_vector,
        users (
          username
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      content: data.content,
      isAnonymous: data.is_anonymous,
      userId: data.user_id,
      username: data.is_anonymous ? 'Anonymous' : data.users?.username,
      createdAt: data.created_at,
      embedding: data.emotional_vector
    };
  } catch (error) {
    console.error(`Error getting letter with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get letters by user ID
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of letters or error
 */
async function getLettersByUserId(userId) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('letters')
      .select(`
        id,
        content,
        is_anonymous,
        user_id,
        created_at,
        emotional_vector,
        users (
          username
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(letter => ({
      id: letter.id,
      content: letter.content,
      isAnonymous: letter.is_anonymous,
      userId: letter.user_id,
      username: letter.users?.username,
      createdAt: letter.created_at,
      embedding: letter.emotional_vector
    }));
  } catch (error) {
    console.error(`Error getting letters for user ${userId}:`, error);
    throw error;
  }
}

module.exports = {
  createLetter,
  getAllLetters,
  getLetterById,
  getLettersByUserId
}; 