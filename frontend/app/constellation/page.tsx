'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    ArrowLeft, RefreshCw, Home, Pen, User,
    ZoomIn, ZoomOut, RotateCcw, Info, Filter, X
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { unifiedApi } from '@/lib/unified-api';
import { ConstellationCanvas, ConstellationControlsRef } from '@/components/visualization/ConstellationCanvas';

const VALID_EMOTIONS = [
    'happy',
    'sad',
    'reflective',
    'excited',
    'calm',
    'anxious',
    'grateful',
    'hopeful',
    'curious',
    'loving',
    'lonely',
    'confused',
    'inspired'
];

const EMOTION_COLORS: Record<string, string> = {
    happy: '#FFD700',     // Gold
    sad: '#6495ED',       // Cornflower Blue
    reflective: '#9370DB', // Medium Purple
    excited: '#FF6347',   // Tomato
    calm: '#20B2AA',      // Light Sea Green
    anxious: '#FF8C00',   // Dark Orange
    grateful: '#32CD32',  // Lime Green
    hopeful: '#87CEEB',   // Sky Blue
    curious: '#BA55D3',   // Medium Orchid
    loving: '#FF69B4',    // Hot Pink
    lonely: '#708090',    // Slate Gray
    confused: '#CD853F',  // Peru
    inspired: '#00CED1',  // Dark Turquoise
    default: '#CCCCCC'    // Light Gray
};

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
        emotion?: string;
    }>>([]);
    const [showInfo, setShowInfo] = useState(false);
    const { user } = useAuth();
    const controlsRef = useRef<ConstellationControlsRef>(null);
    const [filterByUser, setFilterByUser] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [allLetters, setAllLetters] = useState<any[]>([]);
    const [filterByEmotion, setFilterByEmotion] = useState<string | null>(null);
    const [similarityData, setSimilarityData] = useState<Record<string, Array<{ id: string, similarity: number }>>>({});

    useEffect(() => {
        // Fetch all letters and create the constellation
        const fetchLetters = async () => {
            try {
                const fetchedLetters = await api.letters.getAll();

                if (fetchedLetters.length === 0) {
                    setLoading(false);
                    setAllLetters([]);
                    setLetters([]);
                    return;
                }

                // Store all letters
                setAllLetters(fetchedLetters);

                // Generate similarity data for clustering
                await generateSimilarityData(fetchedLetters);

                // Apply filters and transform letters to stars
                applyFiltersAndTransform(fetchedLetters);
            } catch (error) {
                console.error('Error fetching letters:', error);
                setLoading(false);
            }
        };

        fetchLetters();
    }, []);

    // Generate similarity data for clustering
    const generateSimilarityData = async (letters: any[]) => {
        const similarityMap: Record<string, Array<{ id: string, similarity: number }>> = {};

        try {
            // Use a subset of letters as anchors to build similarity network
            // For larger datasets, you might want to limit this to a reasonable number
            const anchors = letters.slice(0, Math.min(letters.length, 10));

            // For each anchor letter, find similar letters
            for (const letter of anchors) {
                const similarLetters = await unifiedApi.letters.findSimilar(letter.id, 10, 0.01);
                similarityMap[letter.id] = similarLetters.map(l => ({
                    id: l.id,
                    similarity: l.similarity
                }));
                console.log(`Found ${similarLetters.length} letters similar to ${letter.id}`);
            }

            setSimilarityData(similarityMap);
            return similarityMap;
        } catch (error) {
            console.error('Error generating similarity data:', error);
            return {};
        }
    };

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

    // Update applyFiltersAndTransform to use similarity data for positioning
    const applyFiltersAndTransform = (lettersToFilter: any[]) => {
        // Apply both user and emotion filters
        let filteredLetters = lettersToFilter;

        // Filter by user if set
        if (filterByUser) {
            filteredLetters = filteredLetters.filter(letter =>
                letter.username === filterByUser ||
                (filterByUser === 'Anonymous' && !letter.username)
            );
        }

        // Filter by emotion if set
        if (filterByEmotion) {
            filteredLetters = filteredLetters.filter(letter =>
                letter.emotion === filterByEmotion
            );
        }

        // Calculate positions based on similarity
        const positions = calculateClusteredPositions(filteredLetters);

        // Generate positions and transform to star format
        const starLetters = filteredLetters.map((letter, index) => ({
            id: letter.id,
            // Use calculated positions from similarity data if available, otherwise use random
            x: positions[letter.id]?.x || (Math.random() * 2 - 1),
            y: positions[letter.id]?.y || (Math.random() * 2 - 1),
            z: positions[letter.id]?.z || (Math.random() * 2 - 1),
            size: Math.random() * 2 + 0.5, // 0.5 to 2.5
            color: letter.color || EMOTION_COLORS[letter.emotion] || EMOTION_COLORS.default,
            content: letter.content,
            username: letter.username || 'Anonymous',
            emotion: letter.emotion || 'unknown'
        }));

        setLetters(starLetters);
        setLoading(false);
    };

    // Function to calculate clustered positions based on similarity
    const calculateClusteredPositions = (letters: any[]) => {
        const positions: Record<string, { x: number, y: number, z: number }> = {};

        // If we don't have similarity data, return empty positions
        if (Object.keys(similarityData).length === 0) {
            return positions;
        }

        // First, place anchor letters (ones we have similarity data for)
        Object.keys(similarityData).forEach((anchorId, index) => {
            // Place anchor letters in a circle at roughly the same height
            const angle = (2 * Math.PI * index) / Object.keys(similarityData).length;
            const radius = 0.8; // Distance from center

            positions[anchorId] = {
                x: radius * Math.cos(angle),
                y: 0.2, // Slight elevation
                z: radius * Math.sin(angle)
            };
        });

        // Then, for each letter, find its position based on similarity to anchors
        letters.forEach(letter => {
            // Skip if we already positioned this letter as an anchor
            if (positions[letter.id]) return;

            let weightedX = 0;
            let weightedY = 0;
            let weightedZ = 0;
            let totalWeight = 0;

            // Check similarity to each anchor
            Object.entries(similarityData).forEach(([anchorId, similarLetters]) => {
                // Find this letter in the anchor's similar letters
                const similarityEntry = similarLetters.find(l => l.id === letter.id);

                if (similarityEntry) {
                    const anchorPos = positions[anchorId];
                    const weight = similarityEntry.similarity;

                    // Apply weighted position based on similarity
                    weightedX += anchorPos.x * weight;
                    weightedY += anchorPos.y * weight;
                    weightedZ += anchorPos.z * weight;
                    totalWeight += weight;
                }
            });

            // If we found similarities, use weighted average position
            if (totalWeight > 0) {
                positions[letter.id] = {
                    x: weightedX / totalWeight + (Math.random() * 0.2 - 0.1), // Add small random offset
                    y: weightedY / totalWeight + (Math.random() * 0.2 - 0.1),
                    z: weightedZ / totalWeight + (Math.random() * 0.2 - 0.1)
                };
            }
        });

        return positions;
    };

    // Add a function to handle user filter selection
    const handleFilterByUser = (username: string) => {
        if (filterByUser === username) {
            setFilterByUser(null); // Toggle off if already selected
        } else {
            setFilterByUser(username);
        }

        // Apply filters to all letters
        applyFiltersAndTransform(allLetters);
    };

    // Add a function to toggle the filter panel
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // Get unique usernames for the filter
    const getUniqueUsernames = () => {
        if (!allLetters.length) return [];

        const usernames = new Set<string>();
        allLetters.forEach(letter => {
            usernames.add(letter.username || 'Anonymous');
        });

        return Array.from(usernames).sort();
    };

    // Add the emotion filter handler
    const handleFilterByEmotion = (emotion: string) => {
        if (filterByEmotion === emotion) {
            setFilterByEmotion(null); // Toggle off if already selected
        } else {
            setFilterByEmotion(emotion);
        }

        // Apply filters to all letters
        applyFiltersAndTransform(allLetters);
    };

    // Get unique emotions from the letters
    const getUniqueEmotions = () => {
        if (!allLetters.length) return [];

        const emotions = new Set<string>();
        allLetters.forEach(letter => {
            if (letter.emotion) {
                emotions.add(letter.emotion);
            }
        });

        return Array.from(emotions).sort();
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

                    {/* <h1 className="constellation-title">Stellar Constellation</h1> */}

                    <div className="constellation-actions">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="nav-button"
                            title="Filter letters"
                            onClick={toggleFilters}
                        >
                            <Filter size={20} />
                        </Button>
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

                {/* Add the filter panel */}
                {showFilters && (
                    <div className="constellation-filters">
                        <div className="filters-header">
                            <h3>Filter Letters</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="close-filters"
                                onClick={toggleFilters}
                            >
                                <X size={16} />
                            </Button>
                        </div>

                        <div className="filters-section">
                            <h4>By Author</h4>
                            <div className="filters-content">
                                {getUniqueUsernames().map(username => (
                                    <Button
                                        key={username}
                                        variant={filterByUser === username ? "primary" : "outline"}
                                        size="sm"
                                        className="filter-button"
                                        onClick={() => handleFilterByUser(username)}
                                    >
                                        <User size={14} className="mr-1" />
                                        {username}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="filters-section">
                            <h4>By Emotion</h4>
                            <div className="filters-content">
                                {getUniqueEmotions().map(emotion => (
                                    <Button
                                        key={emotion}
                                        variant={filterByEmotion === emotion ? "primary" : "outline"}
                                        size="sm"
                                        className="emotion-filter-button"
                                        style={{
                                            borderColor: EMOTION_COLORS[emotion] || EMOTION_COLORS.default,
                                            background: filterByEmotion === emotion
                                                ? EMOTION_COLORS[emotion] || EMOTION_COLORS.default
                                                : 'transparent'
                                        }}
                                        onClick={() => handleFilterByEmotion(emotion)}
                                    >
                                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {(filterByUser || filterByEmotion) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="clear-filter"
                                onClick={() => {
                                    setFilterByUser(null);
                                    setFilterByEmotion(null);
                                    applyFiltersAndTransform(allLetters);
                                }}
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}

                {showInfo && (
                    <div className="constellation-info">
                        <p>Each star represents a letter. Click on any star to read its contents.</p>
                        <p>Currently showing <strong>{letters.length}</strong> of <strong>{allLetters.length}</strong> letters.</p>
                        {filterByUser && (
                            <p>Author filter: <strong>{filterByUser}</strong></p>
                        )}
                        {filterByEmotion && (
                            <p>Emotion filter: <strong style={{ color: EMOTION_COLORS[filterByEmotion] }}>
                                {filterByEmotion.charAt(0).toUpperCase() + filterByEmotion.slice(1)}
                            </strong></p>
                        )}
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
                <div className="flex items-center justify-center h-full">
                    <LoadingSpinner />
                </div>
            ) : letters.length === 0 ? (
                <div className="empty-constellation">
                    <div className="empty-message">
                        <p>No letters found in the constellation.</p>
                        <Link href="/writing">
                            <Button className="empty-action">
                                Write the first letter
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <ConstellationCanvas
                    letters={letters}
                    controlsRef={controlsRef}
                    similarityData={similarityData}
                />
            )}
        </div>
    );
} 