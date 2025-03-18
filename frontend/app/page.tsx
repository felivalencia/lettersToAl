'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star, User, UserPlus, Pen, Eye } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';

export default function Home() {
    const { user, isLoading } = useAuth();

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
                    Write a letter that joins a cosmic tapestry of shared human experiences,
                    each one a star in our interactive constellation.
                </p>

                <div className="hero-cards">
                    <div className="hero-card">
                        <h3 className="card-title">View Constellation</h3>
                        <p className="card-description">
                            Explore the collection of letters visualized as stars in an interactive 3D constellation.
                        </p>
                        <Link href="/constellation" className="card-button-container">
                            <Button variant="outline" size="lg" className="card-button">
                                Explore <Eye className="icon-right" />
                            </Button>
                        </Link>
                    </div>

                    <div className="hero-card">
                        <h3 className="card-title">Write Anonymously</h3>
                        <p className="card-description">
                            Share your thoughts freely without an account. Your letter will appear as anonymous in the constellation.
                        </p>
                        <Link href="/writing?anonymous=true" className="card-button-container">
                            <Button variant="outline" size="lg" className="card-button">
                                Write <Pen className="icon-right" />
                            </Button>
                        </Link>
                    </div>

                    {!isLoading && !user ? (
                        <div className="hero-card">
                            <h3 className="card-title">Create Account</h3>
                            <p className="card-description">
                                Sign up to track your letters, edit them, and build your personal constellation.
                            </p>
                            <div className="card-buttons">
                                <Link href="/auth/signup" className="card-button-container">
                                    <Button variant="primary" size="lg" className="card-button">
                                        Sign Up <UserPlus className="icon-right" />
                                    </Button>
                                </Link>
                                <Link href="/auth/login" className="card-button-container">
                                    <Button variant="secondary" size="lg" className="card-button">
                                        Login <User className="icon-right" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : !isLoading && user ? (
                        <div className="hero-card">
                            <h3 className="card-title">Welcome Back</h3>
                            <p className="card-description">
                                Continue sharing your thoughts or view your personal constellation of letters.
                            </p>
                            <div className="card-buttons">
                                <Link href="/writing" className="card-button-container">
                                    <Button variant="primary" size="lg" className="card-button">
                                        Write Letter <Pen className="icon-right" />
                                    </Button>
                                </Link>
                                <Link href="/profile" className="card-button-container">
                                    <Button variant="secondary" size="lg" className="card-button">
                                        Profile <User className="icon-right" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : null}
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