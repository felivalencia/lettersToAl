// External dependencies
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// Internal dependencies
import { generateToken, verifyToken as verifyJwt, TokenPayload } from './tokenService';

// Define interfaces for user data
interface User {
    id: string;
    username: string;
    email?: string;
    password_hash: string;
    created_at: string;
}

// Export this interface so it can be used in type declarations
export interface AuthUser {
    id: string;
    username: string;
    email?: string;
    accessToken: string;
}

// Bcrypt configuration
const SALT_ROUNDS = 10;

// Helper function to get Supabase client when needed
function getSupabaseClient(): SupabaseClient {
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
 * @param {string} password - The user's password
 * @returns {Promise<AuthUser>} - The authenticated user with token
 */
export async function registerUser(username: string, email: string | undefined, password: string): Promise<AuthUser> {
    const supabase = getSupabaseClient();

    // Check if username already exists
    const { data: existingUsers, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username);

    if (searchError) {
        throw new Error(`Error checking existing users: ${searchError.message}`);
    }

    if (existingUsers && existingUsers.length > 0) {
        throw new Error('Username already exists');
    }

    // If email is provided, check if it already exists
    if (email && email.trim() !== '') {
        const { data: existingEmails, error: emailSearchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (emailSearchError) {
            throw new Error(`Error checking existing emails: ${emailSearchError.message}`);
        }

        if (existingEmails && existingEmails.length > 0) {
            throw new Error('Email already exists');
        }
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Prepare user data - using null for empty email to avoid constraint issues
    const userData = {
        username,
        email: email && email.trim() !== '' ? email : null,
        password_hash: passwordHash
    };

    console.log('Creating user with data:', { ...userData, password_hash: '[REDACTED]' });

    // Create a new user
    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([userData])
        .select();

    if (insertError) {
        console.error('Error creating user:', insertError);
        throw new Error(`Error creating user: ${insertError.message}`);
    }

    if (!newUser || newUser.length === 0) {
        throw new Error('Failed to create user');
    }

    // Generate JWT token
    const user = newUser[0] as User;
    const accessToken = generateToken(user.id, user.username);

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken
    };
}

/**
 * Login a user
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * @returns {Promise<AuthUser>} - The authenticated user with token
 */
export async function loginUser(username: string, password: string): Promise<AuthUser> {
    const supabase = getSupabaseClient();

    // Find user by username
    const { data: users, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username);

    if (searchError) {
        console.error('Error finding user:', searchError);
        throw new Error(`Error finding user: ${searchError.message}`);
    }

    if (!users || users.length === 0) {
        throw new Error('Invalid username or password');
    }

    const user = users[0] as User;
    console.log(`Found user: ${user.username}`);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
        throw new Error('Invalid username or password');
    }

    // Generate JWT token
    const accessToken = generateToken(user.id, user.username);

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken
    };
}

/**
 * Verify JWT token
 * @param {string} token - The JWT token
 * @returns {Promise<AuthUser | null>} - The user or null if token is invalid
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
    const decoded = verifyJwt(token);

    if (!decoded) {
        return null;
    }

    const supabase = getSupabaseClient();

    // Find user by ID
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId);

    if (error || !users || users.length === 0) {
        return null;
    }

    const user = users[0] as User;

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken: token
    };
}

/**
 * Search for users by username 
 * @param {string} searchTerm - The search term to look for in usernames
 * @returns {Promise<Array<{ id: string, username: string }>>} - Array of matching users
 */
export async function searchUsersByUsername(searchTerm: string): Promise<Array<{ id: string, username: string }>> {
    const supabase = getSupabaseClient();

    // Use ILIKE for case-insensitive pattern matching
    const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .ilike('username', `%${searchTerm}%`)
        .limit(10); // Limit results for performance

    if (error) {
        console.error('Error searching users:', error);
        throw new Error(`Error searching users: ${error.message}`);
    }

    return data || [];
} 