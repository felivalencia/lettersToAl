import { Request, Response } from 'express';
import { supabase } from '../utils/supabaseClient';
import { generateEmbedding } from '../services/clusteringService';

// Define AuthenticatedRequest interface here to avoid circular dependency
interface AuthenticatedRequest extends Request {
    user?: { id: string };
}

/**
 * Create a new letter
 * @route POST /api/letters
 */
export const createLetter = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { content, drawing, is_anonymous = true, author_id = null } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Letter content is required' });
        }

        // Determine the correct user_id 
        // If we're using the auth middleware, it might be in req.user.id
        const userId = req.user?.id || author_id || null;

        // If we have a userId and the letter is not anonymous, lookup the username
        let username = null;
        if (userId) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('username')
                .eq('id', userId)
                .single();

            if (!userError && userData) {
                // Store the username for non-anonymous letters
                username = userData.username;
            }
        }

        // Insert letter without embedding initially
        const { data: letter, error } = await supabase
            .from('letters')
            .insert([
                {
                    content,
                    drawing: drawing || null,
                    is_anonymous,
                    user_id: userId,
                    username: is_anonymous ? null : username  // Set username directly in the database
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Schedule embedding generation asynchronously
        // This would trigger a background process in a production environment
        // For MVP, we'll do it synchronously but note that this would be improved
        try {
            const embedding = await generateEmbedding(content);

            // Update the letter with the embedding
            await supabase
                .from('letters')
                .update({ embedding })
                .eq('id', letter.id);
        } catch (embeddingError) {
            // Log the error but don't fail the request
            console.error('Error generating embedding:', embeddingError);
        }

        res.status(201).json({
            id: letter.id,
            created_at: letter.created_at
        });
    } catch (error) {
        console.error('Error creating letter:', error);
        res.status(500).json({ error: 'Failed to create letter' });
    }
};

// Utility function to get username from users data
const getUsernameFromAuthors = (userData: any): string => {
    if (!userData) return 'Unknown User';
    if (Array.isArray(userData)) {
        return userData[0]?.username || 'Unknown User';
    }
    return userData.username || 'Unknown User';
};

/**
 * Get a letter by ID
 * @route GET /api/letters/:id
 */
export const getLetterById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: letter, error } = await supabase
            .from('letters')
            .select(`
                id, 
                content, 
                drawing, 
                created_at, 
                is_anonymous,
                user_id,
                users:user_id (
                    id,
                    username
                ),
                embedding,
                emotion,
                color,
                location
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Letter not found' });
            }
            throw error;
        }

        if (letter) {
            // Log the letter data for debugging
            console.log(`Letter ${letter.id} details:`, {
                id: letter.id,
                is_anonymous: letter.is_anonymous,
                user_id: letter.user_id,
                users: letter.users,
                content_preview: letter.content?.substring(0, 30) + '...'
            });

            // Transform letter to match frontend expected format
            const transformedLetter: any = {
                id: letter.id,
                content: letter.content,
                drawing: letter.drawing,
                createdAt: letter.created_at,
                isAnonymous: letter.is_anonymous,
                embedding: letter.embedding,
                emotion: letter.emotion,
                color: letter.color,
                location: letter.location
            };

            // Set username based on anonymity but always include userId
            if (!letter.is_anonymous && letter.users) {
                // Extract username from the joined user data
                transformedLetter.username = getUsernameFromAuthors(letter.users);
            } else if (!letter.is_anonymous) {
                // If not anonymous but users data is missing, try to load the username
                transformedLetter.username = "Loading...";  // Temporary placeholder
                // We'll fetch the username separately if users join didn't work
                try {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('username')
                        .eq('id', letter.user_id)
                        .single();

                    if (userData && userData.username) {
                        transformedLetter.username = userData.username;
                    } else {
                        transformedLetter.username = 'Unknown User';
                    }
                } catch (userError) {
                    console.error('Error fetching username:', userError);
                    transformedLetter.username = 'Unknown User';
                }
            } else {
                transformedLetter.username = 'Anonymous';
            }
            // Always include userId for all letters
            transformedLetter.userId = letter.user_id;

            res.json(transformedLetter);
        } else {
            res.status(404).json({ error: 'Letter not found' });
        }
    } catch (error) {
        console.error('Error getting letter:', error);
        res.status(500).json({ error: 'Failed to get letter' });
    }
};

/**
 * Get letter map data for visualization
 * @route GET /api/letters/map
 */
export const getLetterMap = async (req: Request, res: Response) => {
    try {
        const { data: letters, error } = await supabase
            .from('letters')
            .select('id, embedding, created_at')
            .not('embedding', 'is', null);

        if (error) throw error;

        // Transform the data for frontend visualization
        // In a real application, this would use a more sophisticated clustering algorithm
        // and potentially include color mapping based on clusters
        const mapData = letters.map(letter => {
            // Parse embedding from JSONB if needed
            const embeddingData = typeof letter.embedding === 'string'
                ? JSON.parse(letter.embedding)
                : letter.embedding;

            // Get embedding array or default to empty array
            const embedding = Array.isArray(embeddingData) ? embeddingData : [];

            // Generate a color based on the first few dimensions of the embedding
            // This is a simple approach for the MVP
            const getColor = (embArray: number[]): string => {
                if (!embArray.length) return '#6e44ff'; // Default purple

                const colors = ['#6e44ff', '#4285f4', '#36bfb1', '#ff66c4', '#ff9e44'];
                const index = Math.floor(Math.abs((embArray[0] || 0) * 10)) % colors.length;
                return colors[index];
            };

            return {
                id: letter.id,
                coords: {
                    x: embedding[0] ? embedding[0] * 20 : (Math.random() - 0.5) * 20,
                    y: embedding[1] ? embedding[1] * 20 : (Math.random() - 0.5) * 20,
                    z: embedding[2] ? embedding[2] * 20 : (Math.random() - 0.5) * 20
                },
                color: getColor(embedding),
                created_at: letter.created_at
            };
        });

        res.json(mapData);
    } catch (error) {
        console.error('Error getting letter map:', error);
        res.status(500).json({ error: 'Failed to get letter map' });
    }
};

/**
 * @desc    Get all letters
 * @route   GET /api/letters
 * @access  Public
 */
export const getAllLetters = async (req: Request, res: Response) => {
    try {
        // Fetch all letters with user data joined
        const { data: letters, error } = await supabase
            .from('letters')
            .select(`
                id, 
                content, 
                drawing, 
                created_at, 
                is_anonymous,
                user_id,
                users:user_id (
                    id,
                    username
                ),
                embedding,
                emotion,
                color,
                location
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Transform the data for client-side use with parallel async operations
        const transformPromises = letters.map(async (letter) => {
            // Log the letter data to diagnose the issue
            console.log(`Letter ${letter.id} data:`, {
                id: letter.id,
                is_anonymous: letter.is_anonymous,
                user_id: letter.user_id,
                users: letter.users,
                content_preview: letter.content?.substring(0, 30) + '...'
            });

            // Create a standardized letter object
            const transformedLetter: any = {
                id: letter.id,
                content: letter.content,
                drawing: letter.drawing,
                createdAt: letter.created_at,
                isAnonymous: letter.is_anonymous,
                embedding: letter.embedding,
                emotion: letter.emotion,
                color: letter.color,
                location: letter.location
            };

            // Set username based on anonymity but always include userId
            if (!letter.is_anonymous && letter.users) {
                // Extract username from the joined user data
                transformedLetter.username = getUsernameFromAuthors(letter.users);
            } else if (!letter.is_anonymous) {
                // If not anonymous but users data is missing, try to load the username
                transformedLetter.username = "Loading...";  // Temporary placeholder

                // We'll fetch the username separately if users join didn't work
                try {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('username')
                        .eq('id', letter.user_id)
                        .single();

                    if (userData && userData.username) {
                        transformedLetter.username = userData.username;
                    } else {
                        transformedLetter.username = 'Unknown User';
                    }
                } catch (userError) {
                    console.error('Error fetching username:', userError);
                    transformedLetter.username = 'Unknown User';
                }
            } else {
                transformedLetter.username = 'Anonymous';
            }

            // Always include userId for all letters
            transformedLetter.userId = letter.user_id;

            return transformedLetter;
        });

        // Wait for all transformations to complete
        const transformedLetters = await Promise.all(transformPromises);

        res.json(transformedLetters);
    } catch (error) {
        console.error('Error getting all letters:', error);
        res.status(500).json({ error: 'Failed to get letters' });
    }
};

/**
 * Update username field for letters that are not anonymous
 * @route POST /api/letters/update-usernames
 * @access Public (for testing)
 */
export const updateUsernames = async (req: Request, res: Response) => {
    try {
        // Get all non-anonymous letters with null usernames
        const { data: letters, error: fetchError } = await supabase
            .from('letters')
            .select('id, user_id, username, is_anonymous')
            .eq('is_anonymous', false)
            .is('username', null);

        if (fetchError) throw fetchError;

        console.log(`Found ${letters?.length || 0} non-anonymous letters with missing usernames`);

        let updatedCount = 0;

        // Process each letter
        for (const letter of letters || []) {
            if (letter.user_id) {
                // Look up the username
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', letter.user_id)
                    .single();

                if (userError) {
                    console.error(`Error fetching user ${letter.user_id}:`, userError);
                    continue;
                }

                if (userData && userData.username) {
                    console.log(`Updating letter ${letter.id} with username ${userData.username}`);

                    // Update the letter with the username
                    const { error: updateError } = await supabase
                        .from('letters')
                        .update({ username: userData.username })
                        .eq('id', letter.id);

                    if (updateError) {
                        console.error(`Error updating letter ${letter.id}:`, updateError);
                    } else {
                        updatedCount++;
                    }
                }
            }
        }

        res.json({
            success: true,
            message: `Updated ${updatedCount} letters`,
            processed: letters?.length || 0
        });
    } catch (error) {
        console.error('Error updating usernames:', error);
        res.status(500).json({ error: 'Failed to update usernames' });
    }
};