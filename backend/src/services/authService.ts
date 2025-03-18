import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

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

// JWT secret key - should be in .env in production
const JWT_SECRET = process.env.JWT_SECRET || 'letters-to-al-secret-key';
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
    const accessToken = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken
    };
}

/**
 * Login a user
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise<AuthUser>} - The authenticated user with token
 */
export async function loginUser(email: string, password: string): Promise<AuthUser> {
    const supabase = getSupabaseClient();

    // Convert email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Attempting login with email: ${normalizedEmail}`);

    // Find user by email
    const { data: users, error: searchError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', normalizedEmail);

    if (searchError) {
        console.error('Error finding user:', searchError);
        throw new Error(`Error finding user: ${searchError.message}`);
    }

    if (!users || users.length === 0) {
        throw new Error('Invalid email or password');
    }

    const user = users[0] as User;
    console.log(`Found user: ${user.username}`);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
        throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const accessToken = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

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
 * @returns {Promise<User | null>} - The user or null if token is invalid
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, username: string };

        if (!decoded.userId) {
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
    } catch (error) {
        return null;
    }
} 