import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { analyzeEmotion } from './emotionService';
import { generateEmbedding, calculateSimilarity } from './embeddingService';

// Type definitions for letters
export interface Letter {
    id: string;
    content: string;
    drawing?: string | null;
    userId?: string | null;
    username?: string | null;
    isAnonymous: boolean; // Keep this as isAnonymous for frontend compatibility
    embedding?: number[];
    emotion?: string | null;
    color?: string | null;
    location?: string | null;
    createdAt: string;
}

// Type definitions for createLetter parameters
export interface CreateLetterData {
    content: string;
    drawing?: string | null;
    userId?: string | null;
    is_anonymous?: boolean; // Use is_anonymous to match database schema
    emotion?: string | null;
    color?: string | null;
    location?: string | null;
    embedding?: number[] | null;
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
export const createLetter = async (letterData: CreateLetterData): Promise<Letter> => {
    try {
        // Ensure the basic required data is present
        if (!letterData.content) {
            throw new Error('Letter content is required');
        }

        // Generate embedding asynchronously and analyze emotion in parallel
        const [embeddingPromise, emotionPromise] = [
            // Generate embedding
            generateEmbedding(letterData.content),
            // Only analyze emotion if not already provided
            !letterData.emotion ? analyzeEmotion(letterData.content) : Promise.resolve(null)
        ];

        // Wait for both processes to complete
        const [embedding, emotionResult] = await Promise.all([embeddingPromise, emotionPromise]);

        // Use analyzed values if not already provided
        let emotion = letterData.emotion;
        let color = letterData.color;

        if (emotionResult) {
            console.log('Emotion analysis result:', emotionResult);
            if (!emotion) emotion = emotionResult.emotion;
            if (!color) color = emotionResult.color;
        }

        // Get username if userId is provided and letter is not anonymous
        let username = null;
        if (!letterData.is_anonymous && letterData.userId) {
            const { data, error } = await getSupabaseClient()
                .from('users')
                .select('username')
                .eq('id', letterData.userId)
                .single();

            if (!error && data) {
                username = data.username;
            }
        }

        // Generate random color if not provided
        if (!color) {
            color = generateRandomColor();
        }

        // Generate random location if not provided
        if (!letterData.location) {
            letterData.location = generateRandomLocation();
        }

        // Prepare letter data for database
        const dbLetterData = {
            content: letterData.content,
            user_id: letterData.userId, // Always store userId even for anonymous letters
            is_anonymous: letterData.is_anonymous, // Use is_anonymous to match the database schema
            emotional_vector: letterData.embedding || embedding, // Store embedding in the emotional_vector column
            emotion: emotion,
            color: color,
            location: letterData.location,
            username: letterData.is_anonymous ? null : username // Set username for non-anonymous letters
        };

        console.log('Preparing letter for database:', {
            ...dbLetterData,
            content: dbLetterData.content.substring(0, 20) + (dbLetterData.content.length > 20 ? '...' : ''),
            emotional_vector: dbLetterData.emotional_vector ? `[vector with ${dbLetterData.emotional_vector.length} dimensions]` : null
        });

        // Insert the letter
        const { data: insertedLetter, error: insertError } = await getSupabaseClient()
            .from('letters')
            .insert([dbLetterData])
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting letter:', insertError);
            throw new Error(`Error inserting letter: ${insertError.message}`);
        }

        if (!insertedLetter) {
            throw new Error('Failed to create letter - no data returned from insert');
        }

        // Format the letter for return
        const letter: Letter = {
            id: insertedLetter.id,
            content: insertedLetter.content,
            drawing: insertedLetter.drawing,
            userId: insertedLetter.user_id,
            username: letterData.is_anonymous ? 'Anonymous' : (username || undefined), // Show anonymous for anonymous letters
            isAnonymous: insertedLetter.is_anonymous, // Use is_anonymous to match db schema
            embedding: insertedLetter.emotional_vector,
            emotion: insertedLetter.emotion,
            color: insertedLetter.color,
            location: insertedLetter.location,
            createdAt: insertedLetter.created_at
        };

        return letter;
    } catch (error) {
        console.error('Error in createLetter service:', error);
        throw error;
    }
};

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
        username: letter.is_anonymous ? 'Anonymous' : (letter.username || 'Unknown User'),
        isAnonymous: letter.is_anonymous, // Use is_anonymous
        embedding: letter.emotional_vector,
        createdAt: letter.created_at
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
        username: data.is_anonymous ? 'Anonymous' : (data.username || 'Unknown User'),
        isAnonymous: data.is_anonymous, // Use is_anonymous
        embedding: data.emotional_vector,
        createdAt: data.created_at
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
        username: letter.is_anonymous ? 'Anonymous' : (letter.username || userId),
        isAnonymous: letter.is_anonymous, // Use is_anonymous
        embedding: letter.emotional_vector,
        createdAt: letter.created_at
    }));
}

// Helper functions for generating random values
const generateRandomColor = (): string => {
    // Generate a random pastel color
    const colors = [
        '#6e44ff', // Purple
        '#4285f4', // Blue
        '#36bfb1', // Teal
        '#ff66c4', // Pink
        '#ff9e44'  // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

const generateRandomLocation = (): string => {
    // Generate a random 3D location in normalized coordinates
    const x = (Math.random() * 2 - 1).toFixed(3);
    const y = (Math.random() * 2 - 1).toFixed(3);
    const z = (Math.random() * 2 - 1).toFixed(3);
    return `${x},${y},${z}`;
};

/**
 * Find letters similar to a given letter or text
 * @param {string | number[]} query - Letter ID or text content or embedding vector
 * @param {number} limit - Maximum number of similar letters to return
 * @param {number} threshold - Minimum similarity threshold (0-1)
 * @returns {Promise<Array<Letter & { similarity: number }>>} - Similar letters with similarity scores
 */
export async function findSimilarLetters(
    query: string,
    limit: number = 5,
    threshold: number = 0.7
): Promise<Array<Letter & { similarity: number }>> {
    const supabase = getSupabaseClient();

    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    try {
        let targetEmbedding: number[] = [];

        // If query is a string, it could be either a letter ID or text content
        if (typeof query === 'string') {
            // Check if it's a UUID (letter ID)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(query)) {
                // It's a letter ID, fetch its embedding
                const { data: letterData, error: letterError } = await supabase
                    .from('letters')
                    .select('emotional_vector')
                    .eq('id', query)
                    .single();

                if (letterError || !letterData || !letterData.emotional_vector) {
                    throw new Error(`Error fetching letter embedding: ${letterError?.message || 'No embedding found'}`);
                }

                targetEmbedding = letterData.emotional_vector;
            } else {
                // It's text content, generate a new embedding
                targetEmbedding = await generateEmbedding(query);

                if (targetEmbedding.length === 0) {
                    throw new Error('Failed to generate embedding for query text');
                }
            }
        }

        console.log(`Looking for letters similar to embedding with ${targetEmbedding.length} dimensions`);

        // First check if database supports vector operations
        // If it does, we can do this directly in the database
        try {
            // Try using RPC function if it exists
            const { data: rpcData, error: rpcError } = await supabase
                .rpc('match_letters', {
                    query_embedding: targetEmbedding,
                    match_threshold: threshold,
                    match_count: limit
                });

            if (!rpcError && rpcData && rpcData.length > 0) {
                console.log(`Found ${rpcData.length} matches using RPC function`);

                // Format the results
                return rpcData.map((item: any) => ({
                    id: item.id,
                    content: item.content,
                    emotion: item.emotion,
                    color: item.color,
                    location: item.location,
                    userId: item.user_id,
                    isAnonymous: item.is_anonymous, // Use is_anonymous
                    createdAt: item.created_at,
                    similarity: item.similarity
                }));
            }
        } catch (rpcError) {
            console.warn('RPC function not available or failed, falling back to client-side similarity:', rpcError);
            // Continue to fallback method
        }

        // Fallback: Get all letters with embeddings and compute similarity client-side
        const { data: letters, error: fetchError } = await supabase
            .from('letters')
            .select('*')
            .not('emotional_vector', 'is', null);

        if (fetchError) {
            console.error('Error fetching letters with embeddings:', fetchError);
            throw new Error(`Error fetching letters: ${fetchError.message}`);
        }

        if (!letters || letters.length === 0) {
            console.log('No letters found with embeddings');
            return [];
        }

        console.log(`Found ${letters.length} letters with embeddings`);
        console.log(`Sample letter embedding field:`, letters[0].emotional_vector ? 'exists' : 'missing');
        console.log(`Target embedding dimensions: ${targetEmbedding.length}`);

        // Check if the first letter has an embedding we can use
        if (letters[0] && letters[0].emotional_vector) {
            const sampleEmbedding = letters[0].emotional_vector;
            console.log(`Sample letter embedding dimensions: ${Array.isArray(sampleEmbedding) ? sampleEmbedding.length : 'not an array'}`);
            console.log(`Sample letter embedding type: ${typeof sampleEmbedding}`);
            if (typeof sampleEmbedding === 'string') {
                try {
                    // Try to parse it if it's a string
                    const parsed = JSON.parse(sampleEmbedding);
                    console.log(`Parsed embedding dimensions: ${Array.isArray(parsed) ? parsed.length : 'not an array'}`);
                } catch (e: any) {
                    console.log(`Failed to parse embedding string: ${e.message}`);
                }
            }
        }

        // Calculate similarity for each letter
        const lettersWithSimilarity = letters.map((letter: any) => {
            let letterEmbedding = letter.emotional_vector;

            // If embedding is a string, try to parse it
            if (typeof letterEmbedding === 'string') {
                try {
                    letterEmbedding = JSON.parse(letterEmbedding);
                } catch (e: any) {
                    console.log(`Failed to parse embedding for letter ${letter.id}: ${e.message}`);
                    return null;
                }
            }

            // Skip letters without valid embeddings
            if (!Array.isArray(letterEmbedding) || letterEmbedding.length === 0) {
                console.log(`Skipping letter ${letter.id} - invalid embedding`);
                return null;
            }

            const similarity = calculateSimilarity(targetEmbedding, letterEmbedding);
            console.log(`Letter ${letter.id} similarity: ${similarity}`);

            return {
                id: letter.id,
                content: letter.content,
                emotion: letter.emotion,
                color: letter.color,
                location: letter.location,
                userId: letter.user_id,
                isAnonymous: letter.is_anonymous, // Use is_anonymous
                embedding: letter.emotional_vector,
                createdAt: letter.created_at,
                similarity
            };
        }).filter(letter => letter !== null);

        // Filter by threshold and sort by similarity
        const filteredResults = lettersWithSimilarity
            .filter(letter => letter.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);

        console.log(`Found ${filteredResults.length} letters above similarity threshold ${threshold}`);

        return filteredResults;

    } catch (error) {
        console.error('Error finding similar letters:', error);
        throw error;
    }
} 