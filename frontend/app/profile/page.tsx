'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ArrowLeft, LogOut, Plus } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { api, Letter } from '@/lib/api'

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
        <div className="profile-container">
            {/* Large username header at the top */}
            <div className="username-header" style={{
                textAlign: 'center',
                padding: '2rem 1rem 1rem',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '1rem',
                position: 'relative',
                zIndex: 2
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.5rem',
                    fontFamily: 'var(--font-playfair), serif'
                }}>
                    {user && typeof user.username === 'string' && user.username.trim()
                        ? `${user.username}'s Profile`
                        : "Your Profile"}
                </h1>
            </div>

            <div className="nav-container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 1.5rem 1.5rem',
                position: 'relative',
                zIndex: 2
            }}>
                <Link href="/">
                    <Button variant="secondary" className="back-button" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem'
                    }}>
                        <ArrowLeft className="icon-left" size={16} />
                        Back to Home
                    </Button>
                </Link>

                <div className="profile-actions">
                    <Link href="/writing">
                        <Button variant="primary" className="write-button" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginRight: '0.75rem'
                        }}>
                            <Plus className="icon-left" size={16} />
                            Write New Letter
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="logout-button"
                        onClick={() => logout()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                        }}
                    >
                        <LogOut className="icon-left" size={14} />
                        Logout
                    </Button>
                    <ThemeToggle />
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-header">
                    <h2 className="letters-title">Your Letters</h2>
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
                    <div className="letters-grid">
                        {letters.map((letter) => (
                            <Card key={letter.id} className="letter-card">
                                <CardHeader>
                                    <CardTitle className="letter-card-title">
                                        {formatDate(letter.createdAt)}
                                    </CardTitle>
                                    <div className="letter-status">
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

            {/* Star background for consistent look with other pages */}
            <div className="star-background" style={{ zIndex: 1 }}>
                <div className="stars">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="background-star"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 3 + 1}px`,
                                height: `${Math.random() * 3 + 1}px`,
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
} 