'use client'

import { useState, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ArrowLeft, LogOut, Plus, User } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { api, Letter } from '@/lib/api'

// Memoized StarBackground component for consistent look
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

export default function ProfilePage() {
    const [letters, setLetters] = useState<Letter[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()
    const { user, isLoading: authLoading, logout } = useAuth()

    // Load user's letters
    useEffect(() => {
        console.log('Auth state:', { user, authLoading })

        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
            console.log('User object:', user)
            fetchUserLetters()
        }
    }, [user, authLoading, router])

    const fetchUserLetters = async () => {
        try {
            setIsLoading(true)
            const userLetters = await api.letters.getMyLetters()
            setLetters(userLetters)
        } catch (err) {
            console.error('Failed to fetch letters', err)
            setError('Failed to load your letters. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return "Recently";
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return "Recently";
        }
    };

    if (authLoading || !user) {
        return (
            <div className="profile-container">
                <div className="loading-container">
                    <LoadingSpinner size="large" />
                    <p className="loading-text">Loading profile...</p>
                </div>
            </div>
        )
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

                {user && (
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
                )}

                <ThemeToggle />
            </div>

            <div className="writing-content">

                <div className="profile-content">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <h2 className="section-title" style={{
                            fontFamily: 'var(--font-playfair), serif',
                            fontSize: '1.75rem',
                            margin: 0
                        }}>Your Letters</h2>

                        <Link href="/writing">
                            <Button variant="primary" className="write-button">
                                <Plus className="icon-left" size={16} />
                                Write New Letter
                            </Button>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="loading-container">
                            <LoadingSpinner size="medium" />
                            <p className="loading-text">Loading your letters...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : letters.length === 0 ? (
                        <div className="empty-state">
                            <p>You haven't written any letters yet.</p>
                            <Link href="/writing">
                                <Button className="mt-4">Write Your First Letter</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="letters-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1.5rem'
                        }}>
                            {letters.map((letter) => (
                                <Card key={letter.id} className="letter-card">
                                    <CardHeader>
                                        <CardTitle className="letter-card-title">
                                            {formatDate(letter.createdAt)}
                                        </CardTitle>
                                        <div className="letter-status" style={{
                                            fontWeight: 'medium',
                                            fontSize: '0.85rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                            backgroundColor: letter.isAnonymous ? 'rgba(54, 191, 177, 0.1)' : 'rgba(110, 68, 255, 0.1)',
                                            color: letter.isAnonymous ? 'rgb(54, 191, 177)' : 'rgb(110, 68, 255)'
                                        }}>
                                            {letter.isAnonymous ? 'Posted anonymously' : 'Posted publicly'}
                                        </div>
                                        {letter.emotion && (
                                            <div className="letter-emotion" style={{
                                                marginTop: '0.5rem',
                                                fontStyle: 'italic',
                                                fontSize: '0.85rem',
                                                opacity: 0.9,
                                                color: letter.color || 'inherit'
                                            }}>
                                                Feeling: {letter.emotion}
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="letter-preview">
                                            {letter.content.length > 150
                                                ? `${letter.content.substring(0, 150)}...`
                                                : letter.content}
                                        </p>
                                        <div className="letter-actions">
                                            <Link href={`/letters/${letter.id}`}>
                                                <Button variant="secondary" size="sm">
                                                    Read Full Letter
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add the StarBackground component */}
            <StarBackground />
        </div>
    )
} 