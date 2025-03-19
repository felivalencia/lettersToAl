/**
 * API Client for Letters to Al application
 * 
 * @deprecated This file is now deprecated in favor of unified-api.ts.
 * Please use the unified API client for all new code and gradually migrate existing code.
 * 
 * Migration guide:
 * - import { api } from '@/lib/api';                → import { unifiedApi } from '@/lib/unified-api';
 * - api.auth.register(data)                        → unifiedApi.auth.register(data)
 * - api.letters.create(data)                       → unifiedApi.letters.create(data)
 * 
 * The interfaces are identical but the implementation is cleaner and more maintainable.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// User types
export interface User {
    id: string;
    username: string;
    email?: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface RegisterData extends LoginData {
    email?: string;
}

// Letter types
export interface Letter {
    id: string;
    content: string;
    isAnonymous: boolean;
    userId?: string;
    username?: string;
    createdAt: string;
    embedding?: number[];
    color?: string;
    emotion?: string;
    location?: string;
}

export interface CreateLetterData {
    content: string;
    isAnonymous: boolean;
    emotion?: string;
    color?: string;
    location?: string;
}

// API client methods
export const api = {
    // Auth endpoints
    auth: {
        // Register a new user
        async register(data: RegisterData): Promise<User> {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include' // Include cookies
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Registration error:', errorData);
                throw new Error(errorData.error || 'Failed to register');
            }

            const result = await response.json();
            return result.user;
        },

        // Login a user
        async login(data: LoginData): Promise<User> {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: data.username, // Try using username as email
                    password: data.password
                }),
                credentials: 'include' // Include cookies
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Login error:', errorData);
                throw new Error(errorData.error || 'Failed to login');
            }

            const result = await response.json();
            return result.user;
        },

        // Logout the current user
        async logout(): Promise<void> {
            const response = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include' // Include cookies
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to logout');
            }
        },

        // Get the current user
        async getMe(): Promise<User | null> {
            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    credentials: 'include' // Include cookies
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        return null; // Not authenticated
                    }
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to get user');
                }

                const userData = await response.json();
                console.log('API getMe response:', userData);

                // Ensure username exists
                if (userData && userData.user && (!userData.user.username || userData.user.username.trim() === '')) {
                    console.warn('User found but username is missing or empty', userData);
                    userData.user.username = 'User';
                }

                return userData.user || null;
            } catch (error) {
                console.error('Error getting current user:', error);
                return null;
            }
        }
    },

    // Letter endpoints
    letters: {
        // Get all letters
        async getAll(): Promise<Letter[]> {
            const response = await fetch(`${API_URL}/letters`, {
                credentials: 'include' // Include cookies for authenticated requests
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch letters');
            }

            return response.json();
        },

        // Get a letter by ID
        async getById(id: string): Promise<Letter> {
            const response = await fetch(`${API_URL}/letters/${id}`, {
                credentials: 'include' // Include cookies for authenticated requests
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch letter');
            }

            return response.json();
        },

        // Get letters by the current user
        async getMyLetters(): Promise<Letter[]> {
            const response = await fetch(`${API_URL}/letters/user/me`, {
                credentials: 'include' // Include cookies for authenticated requests
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch your letters');
            }

            return response.json();
        },

        // Create a new letter
        async create(data: CreateLetterData): Promise<Letter> {
            // Send letter data to the backend - let it handle emotion analysis now
            const letterData = {
                ...data
                // We're no longer generating default values here
                // The backend will handle emotion analysis
            };

            console.log('Creating letter with data:', {
                ...letterData,
                content: letterData.content.substring(0, 20) + (letterData.content.length > 20 ? '...' : '')
            });

            const response = await fetch(`${API_URL}/letters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(letterData),
                credentials: 'include' // Include cookies for authenticated requests
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error creating letter:', errorData);
                throw new Error(errorData.error || 'Failed to create letter');
            }

            return response.json();
        }
    }
}; 