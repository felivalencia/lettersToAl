/**
 * Unified API Client for Letters to Al
 * 
 * This file consolidates the functionality from both api.ts and apiClient.ts
 * into a single, consistent API layer with a standardized approach.
 */

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
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

/**
 * Base API client with reusable fetch logic
 */
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Make an API request with proper error handling
     */
    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        // Default options
        const defaultOptions: RequestInit = {
            credentials: 'include', // Always include cookies for auth
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        const fetchOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, fetchOptions);

            // Handle non-OK responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(
                    errorData.error || errorData.message || `API request failed with status ${response.status}`
                );
                throw error;
            }

            // For 204 No Content responses
            if (response.status === 204) {
                return {} as T;
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${url}`, error);
            throw error;
        }
    }
}

/**
 * Auth API client
 */
class AuthApi extends ApiClient {
    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<User> {
        const result = await this.request<{ user: User }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: data.username,
                email: data.email,
                password: data.password
            }),
        });

        return result.user;
    }

    /**
     * Login a user
     */
    async login(data: LoginData): Promise<User> {
        const result = await this.request<{ user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: data.username,
                password: data.password
            }),
        });

        return result.user;
    }

    /**
     * Logout the current user
     */
    async logout(): Promise<void> {
        await this.request<void>('/auth/logout', {
            method: 'POST',
        });
    }

    /**
     * Get the current user
     */
    async getMe(): Promise<User | null> {
        try {
            return await this.request<User>('/auth/me');
        } catch (error) {
            // Not authenticated or other error
            return null;
        }
    }

    /**
     * Search for users by username
     * @param searchTerm - The search term to look for in usernames
     */
    async searchUsers(searchTerm: string): Promise<Array<{ id: string, username: string }>> {
        return this.request<Array<{ id: string, username: string }>>(`/auth/search?q=${encodeURIComponent(searchTerm)}`);
    }
}

/**
 * Letters API client
 */
class LettersApi extends ApiClient {
    /**
     * Get all letters
     */
    async getAll(): Promise<Letter[]> {
        return this.request<Letter[]>('/letters');
    }

    /**
     * Get a letter by ID
     */
    async getById(id: string): Promise<Letter> {
        return this.request<Letter>(`/letters/${id}`);
    }

    /**
     * Get letters by the current user
     */
    async getMyLetters(): Promise<Letter[]> {
        return this.request<Letter[]>('/letters/user/me');
    }

    /**
     * Create a new letter
     */
    async create(data: CreateLetterData): Promise<Letter> {
        return this.request<Letter>('/letters', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Find letters similar to a given letter or text
     * @param query - Either a letter ID or text content
     * @param limit - Maximum number of results to return (default: 5)
     * @param threshold - Minimum similarity threshold from 0-1 (default: 0.7)
     */
    async findSimilar(
        query: string,
        limit: number = 5,
        threshold: number = 0.7
    ): Promise<Array<Letter & { similarity: number }>> {
        return this.request<Array<Letter & { similarity: number }>>(
            `/letters/similar/${encodeURIComponent(query)}?limit=${limit}&threshold=${threshold}`
        );
    }
}

// Create and export the unified API
const apiClient = new ApiClient(API_URL);
const auth = new AuthApi(API_URL);
const letters = new LettersApi(API_URL);

export const unifiedApi = {
    auth,
    letters,
};

/**
 * Use this to migrate from the old api to the new unifiedApi:
 * 
 * Before:
 * import { api } from '@/lib/api';
 * api.auth.login(...)
 * 
 * After:
 * import { unifiedApi } from '@/lib/unified-api';
 * unifiedApi.auth.login(...)
 */ 