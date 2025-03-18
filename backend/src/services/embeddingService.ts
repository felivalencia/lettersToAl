/**
 * Embedding Service
 * Uses OpenAI to generate embeddings for text content
 */

/**
 * Generates an embedding vector for the given text using OpenAI's API
 * @param text The text to generate an embedding for
 * @returns A vector representing the semantic meaning of the text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OpenAI API key not found, cannot generate embedding');
            return [];
        }

        console.log('Generating embedding for text:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));

        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "text-embedding-ada-002",
                input: text
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error when generating embedding:', errorData);
            return [];
        }

        const data = await response.json();
        const embedding = data.data[0].embedding;

        // Log success but don't log the actual embedding (too large)
        console.log('Successfully generated embedding vector with', embedding.length, 'dimensions');

        // If we need to resize the embedding to match the expected dimensions (e.g., 384)
        // This is a simple approach - in production, you'd use proper dimensionality reduction
        if (embedding.length > 384) {
            console.log('Resizing embedding from', embedding.length, 'to 384 dimensions');
            const resized = resizeEmbedding(embedding, 384);
            return resized;
        }

        return embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return [];
    }
}

/**
 * Resize an embedding vector to the target dimensions
 * Note: This is a simplified approach for demonstration purposes.
 * In production, use proper dimensionality reduction techniques.
 */
function resizeEmbedding(embedding: number[], targetDimensions: number): number[] {
    if (embedding.length <= targetDimensions) {
        return embedding;
    }

    // Method 1: Take the first N dimensions
    return embedding.slice(0, targetDimensions);

    // Alternative method: Average chunks of the embedding
    // const chunkSize = Math.ceil(embedding.length / targetDimensions);
    // const result: number[] = [];

    // for (let i = 0; i < targetDimensions; i++) {
    //     const start = i * chunkSize;
    //     const end = Math.min(start + chunkSize, embedding.length);
    //     const chunk = embedding.slice(start, end);
    //     const avg = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
    //     result.push(avg);
    // }

    // return result;
}

/**
 * Calculates the cosine similarity between two vectors
 * @param vec1 First vector
 * @param vec2 Second vector
 * @returns Similarity score between 0 and 1
 */
export function calculateSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length === 0 || vec2.length === 0 || vec1.length !== vec2.length) {
        return 0;
    }

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        mag1 += vec1[i] * vec1[i];
        mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) {
        return 0;
    }

    return dotProduct / (mag1 * mag2);
} 