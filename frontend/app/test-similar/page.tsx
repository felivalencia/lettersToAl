'use client';

import { useState } from 'react';
import SimilarLetters from '@/components/letters/similar-letters';

export default function TestSimilarLettersPage() {
    const [query, setQuery] = useState('');
    const [threshold, setThreshold] = useState(0.7);
    const [limit, setLimit] = useState(5);
    const [isLetterId, setIsLetterId] = useState(false);
    const [activeQuery, setActiveQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveQuery(query);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-nebula-teal mb-8">Test Similar Letters</h1>

            <div className="bg-cosmic-dark bg-opacity-70 rounded-lg p-6 mb-8 border border-nebula-purple border-opacity-20">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-starlight mb-2">
                            <span className="text-nebula-teal">Search Query:</span>
                            <span className="text-xs ml-2 text-starlight text-opacity-70">
                                (Enter text or a letter ID)
                            </span>
                        </label>
                        <textarea
                            className="w-full bg-cosmic-dark bg-opacity-70 border border-nebula-purple border-opacity-50 rounded-lg p-4 text-starlight resize-none focus:outline-none focus:border-nebula-teal focus:ring-1 focus:ring-nebula-teal transition-all duration-300"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            rows={3}
                            placeholder="Enter some text to find similar letters..."
                        />
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <div>
                            <label className="block text-starlight mb-2">
                                Similarity Threshold: {threshold}
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="0.9"
                                step="0.05"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                className="w-48"
                            />
                        </div>

                        <div>
                            <label className="block text-starlight mb-2">
                                Result Limit: {limit}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="1"
                                value={limit}
                                onChange={(e) => setLimit(parseInt(e.target.value))}
                                className="w-48"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isLetterId"
                                checked={isLetterId}
                                onChange={() => setIsLetterId(!isLetterId)}
                                className="mr-2"
                            />
                            <label htmlFor="isLetterId" className="text-starlight">
                                This is a letter ID
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-nebula-teal hover:bg-nebula-teal-600 text-cosmic-dark font-medium py-2 px-4 rounded transition-colors"
                    >
                        Find Similar Letters
                    </button>
                </form>
            </div>

            {activeQuery && (
                <SimilarLetters
                    query={activeQuery}
                    isLetterId={isLetterId}
                    limit={limit}
                    threshold={threshold}
                />
            )}
        </div>
    );
} 