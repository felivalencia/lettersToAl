/**
 * Type definitions for the Letters to Al application
 * 
 * Centralizing types helps ensure consistency across the application
 * and makes it easier to update types when needed.
 */

/**
 * User entity as stored in the database
 */
export interface DbUser {
    id: string;
    username: string;
    email?: string | null;
    password_hash: string;
    created_at: string;
    updated_at: string;
}

/**
 * User entity as returned to the client
 * Excludes sensitive information like password hash
 */
export interface User {
    id: string;
    username: string;
    email?: string | null;
    createdAt: string;
}

/**
 * Authenticated user with token
 */
export interface AuthUser extends User {
    accessToken: string;
}

/**
 * User registration data
 */
export interface RegisterUserData {
    username: string;
    email?: string;
    password: string;
}

/**
 * User login data
 */
export interface LoginUserData {
    email: string;
    password: string;
}

/**
 * Letter entity as stored in the database
 */
export interface DbLetter {
    id: string;
    content: string;
    user_id?: string | null;
    is_anonymous: boolean;
    emotional_vector?: number[] | null;
    created_at: string;
    updated_at: string;
}

/**
 * Letter entity as returned to the client
 */
export interface Letter {
    id: string;
    content: string;
    userId?: string;
    username?: string;
    isAnonymous: boolean;
    embedding?: number[];
    color?: string;
    emotion?: string;
    location?: string;
    createdAt: string;
}

/**
 * Letter creation data
 */
export interface CreateLetterData {
    content: string;
    isAnonymous: boolean;
    userId?: string;
}

/**
 * Standard API response for consistent error handling
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
} 