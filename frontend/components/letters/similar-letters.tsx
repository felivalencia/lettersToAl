'use client';

import { useState, useEffect } from 'react';
import { unifiedApi } from '@/lib/unified-api';
import { Letter } from '@/lib/unified-api';

interface SimilarLettersProps {
    query: string;
    isLetterId?: boolean;
    limit?: number;
    threshold?: number;
}

export default function SimilarLetters({
    query,
    isLetterId = false,
    limit = 5,
    threshold = 0.7
}: SimilarLettersProps) {
    const [letters, setLetters] = useState<Array<Letter & { similarity: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSimilarLetters() {
            if (!query) {
                setLetters([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const queryToUse = isLetterId ? query : query;
                const similarLetters = await unifiedApi.letters.findSimilar(queryToUse, limit, threshold);
                setLetters(similarLetters);
            } catch (err) {
                console.error('Error fetching similar letters:', err);
                setError('Failed to load similar letters');
            } finally {
                setLoading(false);
            }
        }

        fetchSimilarLetters();
    }, [query, isLetterId, limit, threshold]);

    if (loading) {
        return (
            <div className="p-4 rounded-lg border border-nebula-purple border-opacity-20 bg-cosmic-dark bg-opacity-50">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin h-6 w-6 border-2 border-nebula-teal border-t-transparent rounded-full"></div>
                    <span className="ml-2 text-starlight">Finding similar letters...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg border border-red-500 border-opacity-50 bg-cosmic-dark bg-opacity-50">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    if (letters.length === 0) {
        return (
            <div className="p-4 rounded-lg border border-nebula-purple border-opacity-20 bg-cosmic-dark bg-opacity-50">
                <p className="text-starlight text-opacity-70">No similar letters found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-nebula-teal">Similar Letters</h3>

            <div className="grid gap-4">
                {letters.map((letter) => (
                    <div
                        key={letter.id}
                        className="p-4 rounded-lg border border-nebula-purple border-opacity-20 bg-cosmic-dark bg-opacity-50"
                        style={{
                            borderLeftColor: letter.color || '#6e44ff',
                            borderLeftWidth: '4px'
                        }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-xs text-starlight text-opacity-60">
                                {letter.isAnonymous ? 'Anonymous' : letter.username || 'Unknown'}
                            </div>
                            <div
                                className="text-xs px-2 py-1 rounded-full bg-opacity-20"
                                style={{
                                    backgroundColor: letter.color ? `${letter.color}33` : 'rgba(110, 68, 255, 0.2)',
                                    color: letter.color || '#6e44ff'
                                }}
                            >
                                {letter.emotion || 'Unknown'} • {(letter.similarity * 100).toFixed(1)}% match
                            </div>
                        </div>

                        <p className="text-sm text-starlight whitespace-pre-wrap">
                            {letter.content.length > 150
                                ? `${letter.content.substring(0, 150)}...`
                                : letter.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
} 