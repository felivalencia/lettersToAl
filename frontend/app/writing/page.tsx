'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, LogOut, Send, User } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';

export default function WritingPage() {
    const [letter, setLetter] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!letter.trim()) {
            setError('Please write something before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.letters.create({
                content: letter,
                isAnonymous
            });

            router.push('/constellation');
        } catch (err) {
            console.error('Failed to submit letter', err);
            setError('Failed to submit your letter. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !user) {
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

                <ThemeToggle />
            </div>

            <div className="writing-content">
                <h1 className="writing-title">Write a Letter to Al</h1>
                <p className="writing-description">
                    Share your thoughts, feelings, or reflections. Your letter will join others in our constellation.
                </p>

                <form onSubmit={handleSubmit} className="writing-form">
                    <Textarea
                        placeholder="Dear Al..."
                        value={letter}
                        onChange={(e) => setLetter(e.target.value)}
                        className="writing-textarea"
                        rows={12}
                    />

                    <div className="writing-options">
                        <label className="anonymous-option">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                            />
                            <span>Post anonymously</span>
                        </label>
                    </div>

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting || !letter.trim()}
                        className="submit-button"
                    >
                        {isSubmitting ? (
                            <div className="loading-button-content">
                                <LoadingSpinner size="small" />
                                <span>Sending letter...</span>
                            </div>
                        ) : (
                            <div className="button-content">
                                <Send className="icon-left" />
                                Send Letter
                            </div>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
} 