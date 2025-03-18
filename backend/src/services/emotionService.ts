/**
 * Emotion Analysis Service
 * Uses OpenAI to analyze the emotional content of text
 */

import { createClient } from '@supabase/supabase-js';

// Valid emotions that align with our color scheme and visualization
const VALID_EMOTIONS = [
    'happy',
    'sad',
    'reflective',
    'excited',
    'calm',
    'anxious',
    'grateful',
    'hopeful',
    'curious',
    'loving',
    'lonely',
    'confused',
    'inspired'
];

// Emotion-color mapping for consistent visualization
export const EMOTION_COLORS: Record<string, string> = {
    happy: '#FFD700',     // Gold
    sad: '#6495ED',       // Cornflower Blue
    reflective: '#9370DB', // Medium Purple
    excited: '#FF6347',   // Tomato
    calm: '#20B2AA',      // Light Sea Green
    anxious: '#FF8C00',   // Dark Orange
    grateful: '#32CD32',  // Lime Green
    hopeful: '#87CEEB',   // Sky Blue
    curious: '#BA55D3',   // Medium Orchid
    loving: '#FF69B4',    // Hot Pink
    lonely: '#708090',    // Slate Gray
    confused: '#CD853F',  // Peru
    inspired: '#00CED1',  // Dark Turquoise
    // Default for unknown emotions
    default: '#CCCCCC'    // Light Gray
};

/**
 * Analyzes text using OpenAI to determine the emotional content
 * @param text The text to analyze
 * @returns The detected emotion and its associated color
 */
export async function analyzeEmotion(text: string): Promise<{ emotion: string, color: string }> {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OpenAI API key not found, using fallback emotion analysis');
            return fallbackEmotionAnalysis(text);
        }

        console.log('Analyzing emotion with OpenAI for text:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are an emotion analysis system. Analyze the provided text and return exactly one emotion word from this list: ${VALID_EMOTIONS.join(', ')}. Return only the emotion word, nothing else.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 20
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            return fallbackEmotionAnalysis(text);
        }

        const data = await response.json();
        const emotion = data.choices[0].message.content.trim().toLowerCase();

        console.log('OpenAI detected emotion:', emotion);

        // Check if the returned emotion is valid
        if (VALID_EMOTIONS.includes(emotion)) {
            return {
                emotion,
                color: EMOTION_COLORS[emotion] || EMOTION_COLORS.default
            };
        } else {
            console.warn(`OpenAI returned an invalid emotion: ${emotion}, using fallback`);
            return fallbackEmotionAnalysis(text);
        }

    } catch (error) {
        console.error('Error analyzing emotion with OpenAI:', error);
        return fallbackEmotionAnalysis(text);
    }
}

/**
 * Fallback emotion analysis using keyword matching
 * @param text The text to analyze
 * @returns The detected emotion and its associated color
 */
function fallbackEmotionAnalysis(text: string): { emotion: string, color: string } {
    const normalizedText = text.toLowerCase();

    const emotionKeywords: Record<string, string[]> = {
        happy: ['happy', 'joy', 'laugh', 'delight', 'glad', 'smile', 'cheerful', 'wonderful'],
        sad: ['sad', 'sorrow', 'grief', 'tear', 'miss', 'regret', 'unhappy', 'cry'],
        reflective: ['think', 'reflect', 'remember', 'consider', 'ponder', 'contemplate', 'wonder'],
        excited: ['excited', 'thrilled', 'eager', 'anticipat', 'enthused', 'looking forward'],
        calm: ['calm', 'peace', 'relax', 'tranquil', 'serene', 'gentle', 'quiet'],
        anxious: ['anxious', 'worry', 'nervous', 'tense', 'stress', 'concern', 'fear'],
        grateful: ['thank', 'grateful', 'appreciat', 'bless', 'fortun', 'gratitude'],
        hopeful: ['hope', 'optimist', 'anticipat', 'wish', 'future', 'dream', 'better'],
        curious: ['curious', 'wonder', 'interest', 'fascinate', 'intrigu', 'question'],
        loving: ['love', 'heart', 'affection', 'adore', 'cherish', 'care'],
        lonely: ['alone', 'lonely', 'isolat', 'abandoned', 'separate', 'miss', 'solitary'],
        confused: ['confus', 'uncertain', 'perplex', 'puzzle', 'lost', 'unsure', 'question'],
        inspired: ['inspir', 'motivat', 'creat', 'spark', 'idea', 'passion', 'drive']
    };

    // Count matches for each emotion
    const emotionScores = Object.entries(emotionKeywords).map(([emotion, keywords]) => {
        const score = keywords.reduce((count, keyword) => {
            const regex = new RegExp(keyword, 'gi');
            const matches = normalizedText.match(regex);
            return count + (matches ? matches.length : 0);
        }, 0);

        return { emotion, score };
    });

    // Sort emotions by score (highest first)
    emotionScores.sort((a, b) => b.score - a.score);

    // Get the dominant emotion or default to reflective
    const dominantEmotion = emotionScores[0].score > 0
        ? emotionScores[0].emotion
        : 'reflective';

    console.log('Fallback emotion analysis detected:', dominantEmotion);

    return {
        emotion: dominantEmotion,
        color: EMOTION_COLORS[dominantEmotion] || EMOTION_COLORS.default
    };
} 