'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, User, LoginData, RegisterData } from '@/lib/api'

// Auth context type
interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (data: LoginData) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => Promise<void>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => { },
    register: async () => { },
    logout: async () => { }
})

// Hook to use auth context
export const useAuth = () => useContext(AuthContext)

// Auth provider props
interface AuthProviderProps {
    children: React.ReactNode
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Check if user is already authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await api.auth.getMe()
                setUser(currentUser)
            } catch (error) {
                console.error('Error checking authentication:', error)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    // Login handler
    const login = async (data: LoginData) => {
        setIsLoading(true)
        try {
            const user = await api.auth.login(data)
            setUser(user)
        } finally {
            setIsLoading(false)
        }
    }

    // Register handler
    const register = async (data: RegisterData) => {
        setIsLoading(true)
        try {
            const user = await api.auth.register(data)
            setUser(user)
        } finally {
            setIsLoading(false)
        }
    }

    // Logout handler
    const logout = async () => {
        setIsLoading(true)
        try {
            await api.auth.logout()
            setUser(null)
            router.push('/')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
} 