'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ArrowLeft, Calendar, User } from 'lucide-react'
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
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="letter-detail-container">
            <div className="theme-toggle-container">
                <ThemeToggle />
            </div>

            <div className="back-button-container">
                <Link href="/constellation">
                    <Button variant="ghost">
                        <ArrowLeft className="icon-left" />
                        Back to Constellation
                    </Button>
                </Link>
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
                    <Button onClick={() => router.push('/constellation')}>
                        Return to Constellation
                    </Button>
                </div>
            ) : letter ? (
                <Card className="letter-card">
                    <CardHeader>
                        <div className="letter-meta">
                            <div className="letter-author">
                                <User className="meta-icon" />
                                <span>{letter.isAnonymous ? 'Anonymous' : letter.username || 'Anonymous'}</span>
                            </div>
                            <div className="letter-date">
                                <Calendar className="meta-icon" />
                                <span>{formatDate(letter.createdAt)}</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="letter-content">
                            {letter.content.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter>
                        <div className="letter-actions">
                            <Link href="/writing">
                                <Button>
                                    Write Your Own Letter
                                </Button>
                            </Link>
                            <Link href="/constellation">
                                <Button variant="outline">
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