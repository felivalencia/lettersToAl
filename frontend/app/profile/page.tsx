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
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
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
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

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
            <div className="nav-container">
                <Link href="/">
                    <Button variant="ghost" className="back-button">
                        <ArrowLeft className="icon-left" />
                        Back to Home
                    </Button>
                </Link>

                <h1 className="profile-title">{user.username}'s Profile</h1>

                <div className="profile-actions">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="logout-button"
                        onClick={() => logout()}
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
                    <Link href="/writing">
                        <Button className="new-letter-button">
                            <Plus className="icon-left" />
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
                                </CardHeader>
                                <CardContent>
                                    <p className="letter-preview">
                                        {letter.content.length > 150
                                            ? `${letter.content.substring(0, 150)}...`
                                            : letter.content}
                                    </p>
                                    <div className="letter-actions">
                                        <Link href={`/letters/${letter.id}`}>
                                            <Button variant="ghost" size="sm">
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
    )
} 