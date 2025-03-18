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
            // Generate random values for missing fields
            const letterData = {
                ...data,
                // Default values for missing fields
                emotion: data.emotion || getRandomEmotion(),
                color: data.color || getRandomColor(),
                location: data.location || getRandomLocation()
            };

            console.log('Creating letter with data:', letterData);

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

// Helper functions to generate random values
function getRandomColor(): string {
    const colors = ['#FFD700', '#FF6347', '#4682B4', '#32CD32', '#9370DB', '#FF69B4'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomEmotion(): string {
    const emotions = ['happy', 'sad', 'reflective', 'excited', 'calm', 'anxious', 'grateful'];
    return emotions[Math.floor(Math.random() * emotions.length)];
}

function getRandomLocation(): string {
    return `${(Math.random() * 2 - 1).toFixed(2)},${(Math.random() * 2 - 1).toFixed(2)},${(Math.random() * 2 - 1).toFixed(2)}`;
} 