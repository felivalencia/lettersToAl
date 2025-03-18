/**
 * Supabase API Client
 * 
 * @deprecated This file is now deprecated in favor of unified-api.ts.
 * Direct Supabase access is being replaced with consistent REST API calls.
 * 
 * Migration guide:
 * - import { letterApi } from '@/lib/apiClient';    → import { unifiedApi } from '@/lib/unified-api';
 * - letterApi.submitLetter(content, isAnonymous)    → unifiedApi.letters.create({ content, isAnonymous })
 * - letterApi.getLetter(id)                         → unifiedApi.letters.getById(id)
 * 
 * See unified-api.ts for the full API reference.
 */

import { createClient } from '@supabase/supabase-js';

// These will need to be replaced with actual values from your Supabase project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Letter API functions
export const letterApi = {
    /**
     * Submit a new letter to the system
     */
    submitLetter: async (content: string, isAnonymous: boolean = true) => {
        try {
            const { data, error } = await supabase
                .from('letters')
                .insert([
                    {
                        content,
                        anonymous: isAnonymous,
                        // If not anonymous and the user is logged in, associate with user_id
                        ...(!isAnonymous ? {
                            author_id: (await supabase.auth.getUser()).data.user?.id
                        } : {})
                    }
                ])
                .select();

            if (error) throw error;
            return data?.[0];
        } catch (error) {
            console.error('Error submitting letter:', error);
            throw error;
        }
    },

    /**
     * Get the letter map data for visualization
     */
    getLetterMap: async () => {
        try {
            const { data, error } = await supabase
                .from('letters')
                .select('id, embedding, created_at')
                .not('embedding', 'is', null);

            if (error) throw error;

            // In a production application, coordinates would be computed by backend
            // or stored directly in the database. This is a placeholder transformation.
            return data?.map(letter => {
                // Parse embedding from JSONB if needed
                const embeddingData = typeof letter.embedding === 'string'
                    ? JSON.parse(letter.embedding)
                    : letter.embedding;

                // Get embedding array or default to empty array
                const embedding = Array.isArray(embeddingData) ? embeddingData : [];

                return {
                    id: letter.id,
                    // Transform embedding into 3D coordinates - simplified version
                    coords: {
                        x: (embedding[0] || 0) * 20,
                        y: (embedding[1] || 0) * 20,
                        z: (embedding[2] || 0) * 20
                    },
                    // Color would be determined by clustering in production
                    color: '#6e44ff',
                    createdAt: letter.created_at
                };
            });
        } catch (error) {
            console.error('Error getting letter map:', error);
            throw error;
        }
    },

    /**
     * Get a single letter by ID
     */
    getLetter: async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('letters')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting letter:', error);
            throw error;
        }
    }
};

// Authentication functions - minimal for MVP
export const authApi = {
    signIn: async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    },

    signUp: async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    },

    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            return data.user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }
}; 