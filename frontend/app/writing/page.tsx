'use client';

import { useState, useEffect, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, LogOut, Send, User, Info } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';

// Update the StarBackground component to ensure full coverage
const StarBackground = memo(() => (
    <div className="stars-container" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
    }}>
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
                    animationDuration: `${Math.random() * 5 + 3}s`,
                    pointerEvents: 'none'
                }}
            />
        ))}
    </div>
));

export default function WritingPage() {
    const [letter, setLetter] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading, logout } = useAuth();

    // Check if anonymous mode is requested via URL
    const anonymousMode = searchParams.get('anonymous') === 'true';

    useEffect(() => {
        // Set anonymous state based on URL parameter
        if (anonymousMode) {
            setIsAnonymous(true);
        }
    }, [anonymousMode]);

    // Only redirect if not anonymous mode and not logged in
    useEffect(() => {
        if (!anonymousMode && !isLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isLoading, router, anonymousMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!letter.trim()) {
            setError('Please write something before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            // If we're in anonymous mode or isAnonymous is checked, submit as anonymous
            // The emotion will be detected automatically by the backend
            await api.letters.create({
                content: letter,
                isAnonymous: anonymousMode || isAnonymous
            });

            router.push('/constellation');
        } catch (err) {
            console.error('Failed to submit letter', err);
            setError('Failed to submit your letter. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading only when not in anonymous mode and we're waiting for auth
    if (!anonymousMode && (isLoading || (!user && !anonymousMode))) {
        return (
            <div className="writing-container">
                <div className="loading-container">
                    <LoadingSpinner size="large" />
                    <p className="loading-text">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="writing-container">
            <div className="nav-container">
                <Link href="/">
                    <Button variant="ghost" className="back-button">
                        <ArrowLeft className="icon-left" />
                        Back to Home
                    </Button>
                </Link>

                {user ? (
                    <div className="user-info">
                        <Link href="/profile" className="profile-link">
                            <User className="profile-icon" />
                            <span className="username">{user.username}</span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="logout-button"
                            onClick={() => logout()}
                        >
                            <LogOut className="icon-left" size={14} />
                            Logout
                        </Button>
                    </div>
                ) : anonymousMode ? (
                    <div className="anonymous-info">
                        <Info size={16} className="info-icon" />
                        <span>Writing anonymously</span>
                    </div>
                ) : null}

                <ThemeToggle />
            </div>

            <div className="writing-content">
                <h1 className="writing-title">Write a Letter to Al</h1>
                <p className="writing-description">
                    Share your thoughts, feelings, or reflections. Your letter will join others in our constellation.
                </p>

                {anonymousMode && (
                    <div className="anonymous-banner">
                        <Info className="info-icon" />
                        <p>You are writing anonymously. Your letter will be posted without an account.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="writing-form">
                    <Textarea
                        placeholder="Dear Al..."
                        value={letter}
                        onChange={(e) => setLetter(e.target.value)}
                        className="writing-textarea"
                        rows={12}
                    />

                    <div className="writing-options">
                        {/* Only show anonymous checkbox */}
                        {!anonymousMode && user && (
                            <label className="anonymous-option">
                                <input
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                />
                                <span>Post anonymously</span>
                            </label>
                        )}
                    </div>

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="submit-button"
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="small" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <Send className="icon-left" />
                                <span>Send Letter</span>
                            </>
                        )}
                    </Button>
                </form>
            </div>

            {/* Use the memoized StarBackground component */}
            <StarBackground />
        </div>
    );
} 