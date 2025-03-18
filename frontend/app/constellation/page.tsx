'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, RefreshCw, Home, Pen, User } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';

export default function ConstellationPage() {
    const [loading, setLoading] = useState(true);
    const [letters, setLetters] = useState<Array<{
        id: string;
        x: number;
        y: number;
        z: number;
        size: number;
        color: string;
        content: string;
        username: string;
    }>>([]);
    const { user } = useAuth();

    useEffect(() => {
        // Fetch all letters and create the constellation
        const fetchLetters = async () => {
            try {
                const allLetters = await api.letters.getAll();

                // Generate random positions and colors for the letters
                const starLetters = allLetters.map(letter => ({
                    id: letter.id,
                    x: Math.random() * 2 - 1, // -1 to 1
                    y: Math.random() * 2 - 1, // -1 to 1
                    z: Math.random() * 2 - 1, // -1 to 1
                    size: Math.random() * 2 + 0.5, // 0.5 to 2.5
                    color: getRandomColor(),
                    content: letter.content,
                    username: letter.username || 'Anonymous'
                }));

                setLetters(starLetters);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching letters:', error);
                setLoading(false);
            }
        };

        fetchLetters();
    }, []);

    // Generate a random color from our nebula palette
    const getRandomColor = () => {
        const colors = [
            '#6e44ff', // nebula-purple
            '#4285f4', // nebula-blue
            '#36bfb1', // nebula-teal
            '#ff66c4', // nebula-pink
            '#ff9e44'  // nebula-orange
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <div className="constellation-fullscreen">
            <div className="constellation-overlay">
                <div className="constellation-header">
                    <div className="constellation-nav">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="nav-button" title="Home">
                                <Home size={20} />
                            </Button>
                        </Link>

                        <Link href="/writing">
                            <Button variant="ghost" size="icon" className="nav-button" title="Write a letter">
                                <Pen size={20} />
                            </Button>
                        </Link>

                        {user && (
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" className="nav-button" title="Your profile">
                                    <User size={20} />
                                </Button>
                            </Link>
                        )}
                    </div>

                    <h1 className="constellation-title">Stellar Constellation</h1>

                    <ThemeToggle />
                </div>

                <div className="constellation-info">
                    <p>Each star represents a letter. Click on any star to read its contents.</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <LoadingSpinner size="large" />
                    <p className="loading-text">Generating constellation...</p>
                </div>
            ) : (
                <div className="constellation-canvas">
                    {/* This will be replaced with a Three.js canvas eventually */}
                    <div className="fallback-stars">
                        {letters.map((star) => (
                            <Link href={`/letters/${star.id}`} key={star.id}>
                                <div
                                    className="constellation-star"
                                    style={{
                                        left: `${(star.x + 1) * 50}%`,
                                        top: `${(star.y + 1) * 50}%`,
                                        width: `${star.size}px`,
                                        height: `${star.size}px`,
                                        backgroundColor: star.color,
                                        zIndex: Math.floor((star.z + 1) * 50)
                                    }}
                                    title={`Letter by ${star.username}`}
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 