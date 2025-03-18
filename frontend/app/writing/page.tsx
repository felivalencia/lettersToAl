'use client';

import { useState } from 'react';
import Link from 'next/link';
import WritingArea from '../../components/writing-area';
import { letterApi } from '../../lib/apiClient';

export default function WritingPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmitLetter = async (content: string, isAnonymous: boolean) => {
        try {
            setIsSubmitting(true);
            setError(null);

            await letterApi.submitLetter(content, isAnonymous);

            return Promise.resolve();
        } catch (error) {
            console.error('Error submitting letter:', error);
            setError('Failed to send your letter. Please try again later.');
            return Promise.reject(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col">
            <div className="absolute top-4 left-4 z-10">
                <Link href="/" className="btn btn-secondary text-sm px-3 py-1">
                    ← Back Home
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative">
                {/* Background stars */}
                <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={i}
                            className="star animate-star-pulse"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${Math.max(1, Math.random() * 3)}px`,
                                height: `${Math.max(1, Math.random() * 3)}px`,
                                animationDelay: `${Math.random() * 4}s`
                            }}
                        />
                    ))}
                </div>

                <div className="max-w-2xl w-full">
                    <h1 className="text-4xl font-serif mb-8 text-center">
                        Write Your Letter
                    </h1>

                    <p className="text-center mb-10 text-starlight text-opacity-80 max-w-xl mx-auto">
                        Share your thoughts, feelings, hopes, or reflections.
                        Your words will join others in our cosmic constellation.
                    </p>

                    <WritingArea
                        onSubmit={handleSubmitLetter}
                    />

                    {error && (
                        <div className="mt-6 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="py-4 px-6 text-center text-sm text-starlight text-opacity-70 backdrop-blur-sm">
                <p>
                    Your words will find their place among the stars.
                </p>
            </footer>
        </main>
    );
} 