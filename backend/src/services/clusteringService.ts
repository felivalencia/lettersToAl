import { supabase } from '../utils/supabaseClient';

/**
 * Generate an embedding for the given text.
 * 
 * In a production application, this would call an external API like OpenAI
 * to generate embeddings. For MVP purposes, we're creating a simple
 * mock implementation.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
    // This is a placeholder function that would be replaced with
    // actual embedding generation in production

    // For MVP purposes, we're generating a simple random vector
    // In production, this would call OpenAI or similar API

    // Placeholder implementation:
    // 1. Create a deterministic but simple vector from the text
    // 2. Return a 3D vector for visualization purposes

    // Simple hash function to get deterministic but random-looking values
    const hashString = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    // Use string characteristics to generate "embeddings"
    const sentimentWords = {
        positive: ['happy', 'joy', 'love', 'wonderful', 'great', 'amazing', 'excellent'],
        negative: ['sad', 'angry', 'frustrated', 'disappointed', 'unhappy', 'terrible'],
        neutral: ['think', 'consider', 'perhaps', 'maybe', 'possibly']
    };

    // Analyze text for sentiment words
    const textLower = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    sentimentWords.positive.forEach(word => {
        if (textLower.includes(word)) positiveCount++;
    });

    sentimentWords.negative.forEach(word => {
        if (textLower.includes(word)) negativeCount++;
    });

    sentimentWords.neutral.forEach(word => {
        if (textLower.includes(word)) neutralCount++;
    });

    // Generate a normalized vector with some randomness but influenced by sentiment
    const total = Math.max(1, positiveCount + negativeCount + neutralCount);
    const x = (positiveCount - negativeCount) / total + (hashString(text) % 100) / 1000;
    const y = (neutralCount / total) + (hashString(text.slice(0, 10)) % 100) / 1000;
    const z = (text.length % 100) / 100 + (hashString(text.slice(5, 15)) % 100) / 1000;

    // Add some randomness but keep values between -1 and 1
    return [
        Math.max(-1, Math.min(1, x)),
        Math.max(-1, Math.min(1, y)),
        Math.max(-1, Math.min(1, z))
    ];
};

/**
 * Perform clustering on the letters based on their embeddings.
 * This is a background process that would run periodically.
 */
export const performClustering = async (): Promise<void> => {
    try {
        // Fetch all letters with embeddings
        const { data: letters, error } = await supabase
            .from('letters')
            .select('id, embedding')
            .not('embedding', 'is', null);

        if (error) throw error;

        if (!letters || letters.length === 0) {
            console.log('No letters with embeddings found');
            return;
        }

        // In a production application, this would use a proper clustering algorithm
        // For MVP, we'll use a simplified approach

        // Simple mock clustering - assign cluster based on the first dimension
        const clusteredLetters = letters.map(letter => {
            // Parse embedding from JSONB if needed
            const embeddingData = typeof letter.embedding === 'string'
                ? JSON.parse(letter.embedding)
                : letter.embedding;

            // Get the first dimension for clustering
            const firstDimension = Array.isArray(embeddingData) && embeddingData.length > 0
                ? embeddingData[0]
                : 0;

            const clusterIndex = Math.floor((firstDimension + 1) * 2.5); // Map -1,1 to 0-4

            return {
                id: letter.id,
                cluster_id: clusterIndex
            };
        });

        // Update letters with clusters in batch
        // In a real application, this would be done more efficiently
        for (const letter of clusteredLetters) {
            await supabase
                .from('letters')
                .update({ cluster_id: letter.cluster_id })
                .eq('id', letter.id);
        }

        console.log(`Clustered ${clusteredLetters.length} letters`);
    } catch (error) {
        console.error('Error performing clustering:', error);
    }
}; 