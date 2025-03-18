import { Request, Response } from 'express';
import { supabase } from '../utils/supabaseClient';
import { generateEmbedding } from '../services/clusteringService';

/**
 * Create a new letter
 * @route POST /api/letters
 */
export const createLetter = async (req: Request, res: Response) => {
    try {
        const { content, drawing, anonymous = true } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Letter content is required' });
        }

        // Insert letter without embedding initially
        const { data: letter, error } = await supabase
            .from('letters')
            .insert([
                {
                    content,
                    drawing: drawing || null,
                    anonymous
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

/**
 * Get a letter by ID
 * @route GET /api/letters/:id
 */
export const getLetterById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: letter, error } = await supabase
            .from('letters')
            .select('id, content, drawing, created_at, anonymous')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Letter not found' });
            }
            throw error;
        }

        res.json(letter);
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