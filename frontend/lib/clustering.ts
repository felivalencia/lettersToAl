/**
 * This file serves as a frontend wrapper for clustering logic.
 * In a production environment, most clustering operations would happen on the backend,
 * but this provides some client-side utilities for organization and display.
 */

// Define emotion clusters with their associated colors
export const emotionClusters = {
    joy: '#ff9e44', // Orange
    sadness: '#4285f4', // Blue
    hope: '#36bfb1', // Teal
    love: '#ff66c4', // Pink
    reflection: '#6e44ff', // Purple
    unknown: '#f9f9fb' // Default light color
};

// Simplified lookup function to map cluster IDs to colors
export const getClusterColor = (clusterId: number | null): string => {
    if (clusterId === null || clusterId === undefined) return emotionClusters.unknown;

    const emotions = Object.keys(emotionClusters);
    // Simple mapping using modulo to stay within bounds
    const emotion = emotions[clusterId % emotions.length];
    return emotionClusters[emotion as keyof typeof emotionClusters];
};

// Generate a caption for a cluster
export const getClusterCaption = (clusterId: number | null): string => {
    if (clusterId === null || clusterId === undefined) return 'Uncategorized letters';

    const emotions = Object.keys(emotionClusters);
    const emotion = emotions[clusterId % emotions.length];

    const captions: Record<string, string> = {
        joy: 'Letters expressing happiness and celebration',
        sadness: 'Letters expressing grief and longing',
        hope: 'Letters of aspiration and possibility',
        love: 'Letters of affection and connection',
        reflection: 'Letters of introspection and contemplation',
        unknown: 'Letters awaiting classification'
    };

    return captions[emotion] || captions.unknown;
};

// Parse embedding from JSONB if needed
export const parseEmbedding = (embeddingData: any): number[] => {
    if (!embeddingData) return [];

    // If string, parse it
    if (typeof embeddingData === 'string') {
        try {
            const parsed = JSON.parse(embeddingData);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Error parsing embedding data:', e);
            return [];
        }
    }

    // If already an array, return it
    if (Array.isArray(embeddingData)) {
        return embeddingData;
    }

    // Otherwise, return empty array
    return [];
};

// Format coordinates for three.js from embedding data
export const formatCoordinates = (embeddingData: any): [number, number, number] => {
    const embedding = parseEmbedding(embeddingData);

    if (!embedding || embedding.length < 3) {
        // Return a random position if no embedding exists
        return [
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        ];
    }

    // Scale the coordinates appropriately for visualization
    // In a real app, this would use dimensionality reduction from the backend
    return [
        embedding[0] * 20,
        embedding[1] * 20,
        embedding[2] * 20
    ];
};

/**
 * Find related letters based on proximity in the embedding space
 * In a production app, this would be a more sophisticated backend query
 */
export const findRelatedLetters = (
    letterId: string,
    allLetters: Array<{ id: string, embedding: any }>,
    limit: number = 5
) => {
    const targetLetter = allLetters.find(letter => letter.id === letterId);

    if (!targetLetter) {
        return [];
    }

    const targetEmbedding = parseEmbedding(targetLetter.embedding);

    if (targetEmbedding.length === 0) {
        return [];
    }

    return allLetters
        .filter(letter => letter.id !== letterId)
        .map(letter => {
            const letterEmbedding = parseEmbedding(letter.embedding);

            // Calculate Euclidean distance between embeddings
            const distance = letterEmbedding.length > 0
                ? calculateDistance(targetEmbedding, letterEmbedding)
                : Infinity;

            return { ...letter, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
};

// Helper: Calculate Euclidean distance between two vectors
const calculateDistance = (vectorA: number[], vectorB: number[]): number => {
    if (vectorA.length !== vectorB.length) {
        return Infinity;
    }

    let sum = 0;
    for (let i = 0; i < vectorA.length; i++) {
        sum += Math.pow(vectorA[i] - vectorB[i], 2);
    }

    return Math.sqrt(sum);
}; 