'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the StarMap component to avoid SSR issues with Three.js
const StarMap = dynamic(
    () => import('../../components/star-map/StarMap'),
    { ssr: false }
);

export default function ConstellationPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <main className="min-h-screen flex flex-col">
            <div className="absolute top-4 left-4 z-10">
                <Link href="/" className="btn btn-secondary text-sm px-3 py-1">
                    ← Back Home
                </Link>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl mb-4">Mapping the stars...</h2>
                        <div className="relative w-16 h-16 mx-auto">
                            <div className="star-cluster">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="star animate-star-pulse"
                                        style={{
                                            top: `${Math.sin(i / 5 * Math.PI * 2) * 30 + 50}%`,
                                            left: `${Math.cos(i / 5 * Math.PI * 2) * 30 + 50}%`,
                                            width: '4px',
                                            height: '4px',
                                            animationDelay: `${i * 0.2}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 relative">
                    <StarMap />
                </div>
            )}

            <footer className="py-4 px-6 text-center text-sm text-starlight text-opacity-70 backdrop-blur-sm">
                <p className="max-w-md mx-auto">
                    Each star represents a letter. Closer stars share similar emotions.
                    Click on stars to read their messages.
                </p>
            </footer>
        </main>
    );
} 