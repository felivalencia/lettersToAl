'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

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
                    <Link
                        href="/"
                        className="text-starlight hover:text-nebula-teal transition-colors"
                    >
                        Home
                    </Link>
                    <Link
                        href="/writing"
                        className="text-starlight hover:text-nebula-teal transition-colors"
                    >
                        Write
                    </Link>
                    <Link
                        href="/constellation"
                        className="text-starlight hover:text-nebula-teal transition-colors"
                    >
                        Constellation
                    </Link>
                    <Link
                        href="/about"
                        className="text-starlight hover:text-nebula-teal transition-colors"
                    >
                        About
                    </Link>
                </nav>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-cosmic-dark bg-opacity-95 backdrop-blur-md border-t border-nebula-purple border-opacity-30 py-4">
                    <nav className="flex flex-col space-y-4 px-6">
                        <Link
                            href="/"
                            className="text-starlight py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/writing"
                            className="text-starlight py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Write
                        </Link>
                        <Link
                            href="/constellation"
                            className="text-starlight py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Constellation
                        </Link>
                        <Link
                            href="/about"
                            className="text-starlight py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
} 