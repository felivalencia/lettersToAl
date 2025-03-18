'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
    attribute?: string;
}

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    enableSystem = true,
    disableTransitionOnChange = false,
    attribute = 'data-theme',
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove previous theme class
        root.removeAttribute(attribute);

        // Apply new theme
        if (theme === 'system' && enableSystem) {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.setAttribute(attribute, systemTheme);
        } else {
            root.setAttribute(attribute, theme);
        }
    }, [theme, enableSystem, attribute]);

    // Check for saved theme in localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    // Setup system theme change detection
    useEffect(() => {
        if (!enableSystem) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === 'system') {
                document.documentElement.setAttribute(
                    attribute,
                    mediaQuery.matches ? 'dark' : 'light'
                );
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, attribute, enableSystem]);

    const value = {
        theme,
        setTheme: (newTheme: Theme) => {
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        },
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
} 