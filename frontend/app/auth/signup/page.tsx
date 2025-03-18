'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { StarBackground } from '@/components/star-background'
import { useAuth } from '@/components/auth-provider'

export default function SignupPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()
    const { register, user, isLoading } = useAuth()

    // Redirect if already logged in
    useEffect(() => {
        if (user && !isLoading) {
            router.push('/writing')
        }
    }, [user, isLoading, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!username || !password) {
            setError('Please enter both username and password')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        try {
            await register({ username, email, password })
            router.push('/writing')
        } catch (err) {
            setError('Failed to create account. Please try a different username.')
        }
    }

    return (
        <div className="auth-container">
            <div className="theme-toggle-container">
                <ThemeToggle />
            </div>

            <div className="back-button-container">
                <Link href="/">
                    <Button variant="ghost">
                        <ArrowLeft className="icon-left" />
                        Back to Home
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Join the cosmic community of letter writers</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="auth-form-content">
                        <div className="form-group">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <Label htmlFor="email">Email (optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="error-message">{error}</div>
                        )}
                    </CardContent>

                    <CardFooter className="auth-form-footer">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="auth-submit-button"
                        >
                            {isLoading ? (
                                <div className="loading-button-content">
                                    <div className="loading-spinner" />
                                    Creating account...
                                </div>
                            ) : (
                                <div className="button-content">
                                    <UserPlus className="icon-left" />
                                    Sign Up
                                </div>
                            )}
                        </Button>

                        <div className="auth-alt-action">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="auth-link">
                                Sign In
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>

            <div className="star-background">
                <StarBackground stars={50} />
            </div>
        </div>
    )
} 