'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ArrowLeft, Calendar, User, Pen } from 'lucide-react'
import { api, Letter } from '@/lib/api'

interface LetterPageProps {
    params: {
        id: string
    }
}

export default function LetterPage({ params }: LetterPageProps) {
    const [letter, setLetter] = useState<Letter | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchLetter = async () => {
            try {
                setIsLoading(true)
                const fetchedLetter = await api.letters.getById(params.id)
                setLetter(fetchedLetter)
            } catch (err) {
                console.error('Failed to fetch letter:', err)
                setError('Failed to load this letter. It may have been removed or does not exist.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchLetter()
    }, [params.id])

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

    return (
        <div className="letter-detail-container">
            <div className="nav-container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                position: 'relative',
                zIndex: 10,
                width: '100%'
            }}>
                <Link href="/constellation">
                    <Button variant="secondary" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <ArrowLeft className="icon-left" size={16} />
                        Back to Constellation
                    </Button>
                </Link>

                <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link href="/writing">
                        <Button variant="primary" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Pen className="icon-left" size={16} />
                            Write New Letter
                        </Button>
                    </Link>
                    <ThemeToggle />
                </div>
            </div>

            {isLoading ? (
                <div className="loading-container">
                    <LoadingSpinner size="large" />
                    <p className="loading-text">Loading letter...</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <h2 className="error-title">Error</h2>
                    <p className="error-message">{error}</p>
                    <Button variant="secondary" onClick={() => router.push('/constellation')}>
                        Return to Constellation
                    </Button>
                </div>
            ) : letter ? (
                <Card className="letter-card">
                    <CardHeader>
                        <div className="letter-meta">
                            <div className="letter-author">
                                <User className="meta-icon" />
                                <span>
                                    {letter.isAnonymous
                                        ? 'Anonymous'
                                        : (letter.username && letter.username.trim() !== ''
                                            ? letter.username
                                            : 'Anonymous')}
                                </span>
                            </div>
                            <div className="letter-date">
                                <Calendar className="meta-icon" />
                                <span>{formatDate(letter.createdAt)}</span>
                            </div>
                        </div>

                        {letter.emotion && (
                            <div className="letter-emotion" style={{
                                color: letter.color || 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '1rem',
                                marginTop: '-0.5rem'
                            }}>
                                <span style={{
                                    fontSize: '0.95rem',
                                    fontStyle: 'italic'
                                }}>
                                    Feeling: {letter.emotion}
                                </span>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent>
                        <div className="letter-content">
                            {letter.content.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter>
                        <div className="letter-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%' }}>
                            <Link href="/writing">
                                <Button variant="primary">
                                    Write Your Own Letter
                                </Button>
                            </Link>
                            <Link href="/constellation">
                                <Button variant="secondary">
                                    Back to Constellation
                                </Button>
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            ) : null}

            <div className="star-background">
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