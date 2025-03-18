'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    ArrowLeft, RefreshCw, Home, Pen, User,
    ZoomIn, ZoomOut, RotateCcw, Info
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { ConstellationCanvas, ConstellationControlsRef } from '@/components/constellation-canvas';

export default function ConstellationPage() {
    const [loading, setLoading] = useState(true);
    const [letters, setLetters] = useState<Array<{
        id: string;
        x: number;
        y: number;
        z: number;
        size: number;
        color: string;
        content: string;
        username: string;
    }>>([]);
    const [showInfo, setShowInfo] = useState(false);
    const { user } = useAuth();
    const controlsRef = useRef<ConstellationControlsRef>(null);

    useEffect(() => {
        // Fetch all letters and create the constellation
        const fetchLetters = async () => {
            try {
                const allLetters = await api.letters.getAll();

                if (allLetters.length === 0) {
                    setLoading(false);
                    return;
                }

                // Generate random positions and colors for the letters
                const starLetters = allLetters.map(letter => ({
                    id: letter.id,
                    x: Math.random() * 2 - 1, // -1 to 1
                    y: Math.random() * 2 - 1, // -1 to 1
                    z: Math.random() * 2 - 1, // -1 to 1
                    size: Math.random() * 2 + 0.5, // 0.5 to 2.5
                    color: getRandomColor(),
                    content: letter.content,
                    username: letter.username || 'Anonymous'
                }));

                setLetters(starLetters);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching letters:', error);
                setLoading(false);
            }
        };

        fetchLetters();
    }, []);

    // Generate a random color from our nebula palette
    const getRandomColor = () => {
        const colors = [
            '#6e44ff', // nebula-purple
            '#4285f4', // nebula-blue
            '#36bfb1', // nebula-teal
            '#ff66c4', // nebula-pink
            '#ff9e44'  // nebula-orange
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleZoomIn = () => {
        controlsRef.current?.zoomIn();
    };

    const handleZoomOut = () => {
        controlsRef.current?.zoomOut();
    };

    const handleReset = () => {
        controlsRef.current?.resetCamera();
    };

    const toggleInfo = () => {
        setShowInfo(!showInfo);
    };

    return (
        <div className="constellation-fullscreen">
            <div className="constellation-overlay">
                <div className="constellation-header">
                    <div className="constellation-nav">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="nav-button" title="Home">
                                <Home size={20} />
                            </Button>
                        </Link>

                        <Link href="/writing">
                            <Button variant="ghost" size="icon" className="nav-button" title="Write a letter">
                                <Pen size={20} />
                            </Button>
                        </Link>

                        {user && (
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" className="nav-button" title="Your profile">
                                    <User size={20} />
                                </Button>
                            </Link>
                        )}
                    </div>

                    <h1 className="constellation-title">Stellar Constellation</h1>

                    <div className="constellation-actions">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="nav-button"
                            title="Information"
                            onClick={toggleInfo}
                        >
                            <Info size={20} />
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>

                {showInfo && (
                    <div className="constellation-info">
                        <p>Each star represents a letter. Click on any star to read its contents.</p>
                        <p>Use the controls below to navigate the constellation.</p>
                    </div>
                )}

                {!loading && letters.length > 0 && (
                    <div className="constellation-controls">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="control-button"
                            title="Zoom in"
                            onClick={handleZoomIn}
                        >
                            <ZoomIn size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="control-button"
                            title="Zoom out"
                            onClick={handleZoomOut}
                        >
                            <ZoomOut size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="control-button"
                            title="Reset view"
                            onClick={handleReset}
                        >
                            <RotateCcw size={18} />
                        </Button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="loading-container">
                    <LoadingSpinner size="large" />
                    <p className="loading-text">Generating constellation...</p>
                </div>
            ) : letters.length === 0 ? (
                <div className="empty-constellation">
                    <div className="empty-message">
                        <h2>No letters found</h2>
                        <p>Be the first to write a letter and start the constellation.</p>
                        <Link href="/writing">
                            <Button className="write-button">
                                <Pen size={16} className="mr-2" />
                                Write a Letter
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <ConstellationCanvas letters={letters} controlsRef={controlsRef} />
            )}
        </div>
    );
} 