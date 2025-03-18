'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './use-theme';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch by ensuring client-side rendering only
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="theme-toggle-placeholder" />;
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Sun className="theme-icon" />
            ) : (
                <Moon className="theme-icon" />
            )}
        </button>
    );
} 