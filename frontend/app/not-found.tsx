'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function NotFound() {
    return (
        <div className="not-found-container">
            <div className="theme-toggle-container">
                <ThemeToggle />
            </div>

            <div className="not-found-content">
                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">Page Not Found</h2>
                <p className="not-found-message">
                    The letter you're looking for seems to have drifted away into the cosmos.
                </p>

                <div className="not-found-actions">
                    <Button asChild variant="outline">
                        <Link href="/" className="not-found-button">
                            <Home className="button-icon" />
                            Return Home
                        </Link>
                    </Button>

                    <Button asChild variant="outline">
                        <Link href="/constellation" className="not-found-button">
                            <ArrowLeft className="button-icon" />
                            Explore Constellation
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="star-background">
                <div className="stars">
                    {[...Array(50)].map((_, i) => {
                        const size = Math.random() * 3 + 1;
                        const top = Math.random() * 100;
                        const left = Math.random() * 100;
                        const delay = Math.random() * 5;

                        return (
                            <div
                                key={i}
                                className="background-star"
                                style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    top: `${top}%`,
                                    left: `${left}%`,
                                    animationDelay: `${delay}s`,
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
} 