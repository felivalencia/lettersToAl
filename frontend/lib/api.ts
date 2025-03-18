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
}

export interface CreateLetterData {
    content: string;
    isAnonymous: boolean;
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
                const error = await response.json();
                throw new Error(error.error || 'Failed to register');
            }

            return response.json();
        },

        // Login a user
        async login(data: LoginData): Promise<User> {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include' // Include cookies
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to login');
            }

            return response.json();
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

                return response.json();
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
            const response = await fetch(`${API_URL}/letters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include' // Include cookies for authenticated requests
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create letter');
            }

            return response.json();
        }
    }
}; 