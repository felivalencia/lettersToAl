'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
    return (
        <main className="home-container">
            <div className="theme-toggle-container">
                <ThemeToggle />
            </div>

            <div className="hero-content">
                <h1 className="hero-title">
                    Letters to Al
                </h1>

                <p className="hero-subtitle">
                    A constellation of human thoughts, feelings, and reflections
                </p>

                <p className="hero-description">
                    Write an anonymous letter that joins a cosmic tapestry of shared human experiences,
                    each one a star in our interactive constellation.
                </p>

                <div className="hero-buttons">
                    <Link href="/auth/login">
                        <Button variant="primary" size="lg">
                            Sign In
                        </Button>
                    </Link>

                    <Link href="/constellation">
                        <Button variant="outline" size="lg">
                            Explore Constellation
                            <Star className="icon-right" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="star-background">
                <StarBackground />
            </div>
        </main>
    );
}

function StarBackground() {
    // Create 100 stars with random positions and animation delays
    return (
        <div className="stars-container">
            {Array.from({ length: 100 }).map((_, i) => (
                <div
                    key={i}
                    className="star-bg"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.max(1, Math.random() * 3)}px`,
                        height: `${Math.max(1, Math.random() * 3)}px`,
                        opacity: Math.random() * 0.7 + 0.3,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${Math.random() * 5 + 3}s`
                    }}
                />
            ))}
        </div>
    );
} 