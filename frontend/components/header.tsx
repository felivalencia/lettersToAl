'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

// Navigation links defined in one place to avoid duplication
const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/writing', label: 'Write' },
    { href: '/constellation', label: 'Constellation' },
    { href: '/about', label: 'About' }
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="relative z-10 py-4 px-6 md:px-10 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-serif">
                    Letters to Al
                </Link>

                {/* Mobile menu button */}
                <button
                    className="md:hidden text-starlight"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>

                {/* Desktop navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-starlight hover:text-nebula-teal transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-cosmic-dark bg-opacity-95 backdrop-blur-md border-t border-nebula-purple border-opacity-30 py-4">
                    <nav className="flex flex-col space-y-4 px-6">
                        {NAV_LINKS.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-starlight py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
} 