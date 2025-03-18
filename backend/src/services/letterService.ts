import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define interfaces for letter data
interface Letter {
    id: string;
    content: string;
    emotion?: string;
    color?: string;
    location?: string;
    userId?: string | null;
    username?: string;
    isAnonymous: boolean;
    embedding?: number[];
    created_at: string;
}

interface CreateLetterData {
    content: string;
    emotion?: string;
    color?: string;
    location?: string;
    userId?: string | null;
    isAnonymous: boolean;
    embedding?: number[];
}

// Helper function to get Supabase client when needed
function getSupabaseClient(): SupabaseClient {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    // Check for environment variables
    console.log('Checking Supabase credentials:');
    console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
    console.log('SUPABASE_SERVICE_KEY:', supabaseKey ? 'Set' : 'Not set');

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
 * @param {CreateLetterData} letterData - The letter data
 * @returns {Promise<Letter>} - The created letter
 */
export async function createLetter(letterData: CreateLetterData): Promise<Letter> {
    const supabase = getSupabaseClient();

    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    let username = null;

    // If not anonymous, fetch the username
    if (!letterData.isAnonymous && letterData.userId) {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('username')
            .eq('id', letterData.userId)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
        } else if (userData) {
            username = userData.username;
        }
    }

    // Let's check if the letters table has the expected columns
    try {
        // First, attempt to describe the table structure
        console.log('Attempting to write letter with data:', {
            ...letterData,
            content: letterData.content.substring(0, 20) + (letterData.content.length > 20 ? '...' : '')
        });

        // Prepare letter data, handling potential missing columns
        const letterRecord: any = {
            content: letterData.content,
            is_anonymous: letterData.isAnonymous,
            user_id: letterData.userId
        };

        // Only add these fields if they're provided
        if (username) letterRecord.username = username;
        if (letterData.emotion) letterRecord.emotion = letterData.emotion;
        if (letterData.color) letterRecord.color = letterData.color;
        if (letterData.location) letterRecord.location = letterData.location;
        if (letterData.embedding) letterRecord.embedding = letterData.embedding;

        // Insert the letter
        const { data, error } = await supabase
            .from('letters')
            .insert([letterRecord])
            .select();

        if (error) {
            console.error('Error creating letter:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            throw new Error(`Failed to create letter: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error('Failed to create letter: No data returned');
        }

        // Format the letter to match our interface
        const letter = data[0];
        console.log('Successfully created letter with ID:', letter.id);

        return {
            id: letter.id,
            content: letter.content,
            emotion: letter.emotion,
            color: letter.color,
            location: letter.location,
            userId: letter.user_id,
            username: letter.username || 'Anonymous',
            isAnonymous: letter.is_anonymous,
            embedding: letter.embedding,
            created_at: letter.created_at
        };
    } catch (error) {
        console.error('Caught error in createLetter:', error);
        throw error;
    }
}

/**
 * Get all letters
 * @returns {Promise<Letter[]>} - All letters
 */
export async function getAllLetters(): Promise<Letter[]> {
    const supabase = getSupabaseClient();

    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('letters')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching letters:', error);
        throw new Error(`Failed to fetch letters: ${error.message}`);
    }

    if (!data) {
        return [];
    }

    // Format letters to match our interface
    return data.map(letter => ({
        id: letter.id,
        content: letter.content,
        emotion: letter.emotion,
        color: letter.color,
        location: letter.location,
        userId: letter.user_id,
        username: letter.username || 'Anonymous',
        isAnonymous: letter.is_anonymous,
        embedding: letter.embedding,
        created_at: letter.created_at
    }));
}

/**
 * Get letter by ID
 * @param {string} id - The letter ID
 * @returns {Promise<Letter | null>} - The letter or null if not found
 */
export async function getLetterById(id: string): Promise<Letter | null> {
    const supabase = getSupabaseClient();

    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching letter with ID ${id}:`, error);
        return null;
    }

    if (!data) {
        return null;
    }

    // Format letter to match our interface
    return {
        id: data.id,
        content: data.content,
        emotion: data.emotion,
        color: data.color,
        location: data.location,
        userId: data.user_id,
        username: data.username || 'Anonymous',
        isAnonymous: data.is_anonymous,
        embedding: data.embedding,
        created_at: data.created_at
    };
}

/**
 * Get letters by user ID
 * @param {string} userId - The user ID
 * @returns {Promise<Letter[]>} - The user's letters
 */
export async function getLettersByUserId(userId: string): Promise<Letter[]> {
    const supabase = getSupabaseClient();

    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching letters for user ${userId}:`, error);
        throw new Error(`Failed to fetch user letters: ${error.message}`);
    }

    if (!data) {
        return [];
    }

    // Format letters to match our interface
    return data.map(letter => ({
        id: letter.id,
        content: letter.content,
        emotion: letter.emotion,
        color: letter.color,
        location: letter.location,
        userId: letter.user_id,
        username: letter.username || 'Anonymous',
        isAnonymous: letter.is_anonymous,
        embedding: letter.embedding,
        created_at: letter.created_at
    }));
} 