'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    ArrowLeft, RefreshCw, Home, Pen, User,
    ZoomIn, ZoomOut, RotateCcw, Info, Filter, X, Search
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { api } from '@/lib/api';
import { unifiedApi } from '@/lib/unified-api';
import { ConstellationCanvas, ConstellationControlsRef } from '@/components/visualization/ConstellationCanvas';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { X as XIcon } from 'lucide-react';
import SimilarLetters from '@/components/letters/similar-letters';

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

// Memoized StarBackground component
const StarBackground = memo(() => (
    <div className="stars-container">
        {Array.from({ length: 100 }).map((_, i) => (
            <div
                key={i}
                className="star-bg"
                style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.max(1, Math.random() * 3)}px`,
                    height: `${Math.max(1, Math.random() * 3)}px`,
                    opacity: Math.random() * 0.7 + 0.3,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 5 + 3}s`,
                    pointerEvents: 'none' // Ensure stars themselves don't block interaction
                }}
            />
        ))}
    </div>
));

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
        userId?: string;
    }>>([]);
    const [showInfo, setShowInfo] = useState(false);
    const { user } = useAuth();
    const controlsRef = useRef<ConstellationControlsRef>(null);
    const [filterByUser, setFilterByUser] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [allLetters, setAllLetters] = useState<any[]>([]);
    const [filterByEmotion, setFilterByEmotion] = useState<string | null>(null);
    const [similarityData, setSimilarityData] = useState<Record<string, Array<{ id: string, similarity: number }>>>({});

    // Add new state variables for user search
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string, username: string }>>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Add state to track which users have been manually searched for and should appear in the filter
    const [selectedUserFilters, setSelectedUserFilters] = useState<Array<{ id: string, username: string }>>([]);

    // Add these state variables in the main component
    const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
    const [selectedLetterData, setSelectedLetterData] = useState<any | null>(null);
    const [isLoadingLetter, setIsLoadingLetter] = useState(false);

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

    // Add a function to handle user filter selection
    const handleFilterByUser = (username: string, userId: string | null = null) => {
        // If clicking on a search result, add it to selected filters
        if (userId && username !== 'Anonymous') {
            const existingFilter = selectedUserFilters.find(f => f.id === userId);

            if (!existingFilter) {
                setSelectedUserFilters(prev => [...prev, { id: userId, username }]);
            }
        }

        // If anonymous, use 'Anonymous' as the ID
        const actualUserId = (username === 'Anonymous') ? 'Anonymous' : userId;

        // Calculate new filter value directly (don't rely on state update)
        const newFilterValue = filterByUser === actualUserId ? null : actualUserId;

        // Set the state for future reference
        setFilterByUser(newFilterValue);

        // Clear search when filter is applied
        setUserSearchTerm('');
        setSearchResults([]);

        // Apply filters with the new value directly
        applyFiltersWithValue(allLetters, newFilterValue, filterByEmotion);
    };

    // Add function to remove a user filter
    const removeUserFilter = (userId: string) => {
        // Remove from selected filters
        setSelectedUserFilters(prev => prev.filter(filter => filter.id !== userId));

        // If this was the active filter, clear it
        if (filterByUser === userId) {
            setFilterByUser(null);
            applyFiltersAndTransform(allLetters);
        }
    };

    // Add a function to toggle the filter panel
    const toggleFilters = () => {
        setShowFilters(!showFilters);
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

    // Add the emotion filter handler
    const handleFilterByEmotion = (emotion: string) => {
        // Calculate new filter value directly
        const newFilterValue = filterByEmotion === emotion ? null : emotion;

        // Set the state for future reference
        setFilterByEmotion(newFilterValue);

        // Apply filters with the new value directly
        applyFiltersWithValue(allLetters, filterByUser, newFilterValue);
    };

    // New function that applies filters with explicit values
    const applyFiltersWithValue = (lettersToFilter: any[], userFilter: string | null, emotionFilter: string | null) => {
        let filteredLetters = lettersToFilter;

        if (userFilter) {
            if (userFilter === 'Anonymous') {
                // Show only letters that are marked as anonymous regardless of userId
                filteredLetters = filteredLetters.filter(letter => letter.isAnonymous === true);
            } else {
                // When filtering by a specific user, show ONLY their non-anonymous letters
                filteredLetters = filteredLetters.filter(letter =>
                    letter.userId === userFilter && letter.isAnonymous === false
                );
            }
        }

        if (emotionFilter) {
            filteredLetters = filteredLetters.filter(letter =>
                letter.emotion === emotionFilter
            );
        }

        const positions = calculateClusteredPositions(filteredLetters);

        const starLetters = filteredLetters.map((letter) => {
            // Set username based on anonymity flag, not based on the presence of userId
            const username = letter.isAnonymous === true ? 'Anonymous' : (letter.username || 'Unknown User');

            return {
                id: letter.id,
                x: positions[letter.id]?.x || (Math.random() * 2 - 1),
                y: positions[letter.id]?.y || (Math.random() * 2 - 1),
                z: positions[letter.id]?.z || (Math.random() * 2 - 1),
                size: Math.random() * 2 + 0.5,
                color: letter.color || EMOTION_COLORS[letter.emotion] || EMOTION_COLORS.default,
                content: letter.content,
                username: username,
                emotion: letter.emotion || 'unknown',
                created_at: letter.createdAt || letter.created_at,
                userId: letter.userId,
                isAnonymous: letter.isAnonymous
            };
        });

        setLetters(starLetters);
        setLoading(false);
    };

    // Modify the existing function to use the new one
    const applyFiltersAndTransform = (lettersToFilter: any[]) => {
        applyFiltersWithValue(lettersToFilter, filterByUser, filterByEmotion);
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

    // Get unique userIds for the filter - only display Anonymous by default
    const getUniqueUserIds = () => {
        // Create array to hold user filter options
        const users: Array<{ id: string, username: string }> = [];
        let hasAnonymous = false;

        // Check if we have any anonymous letters based on isAnonymous flag
        allLetters.forEach(letter => {
            if (letter.isAnonymous === true) {
                hasAnonymous = true;
            }
        });

        // Add anonymous at the beginning if it exists
        if (hasAnonymous) {
            users.push({ id: 'Anonymous', username: 'Anonymous' });
        }

        // Add non-anonymous user filters
        const uniqueUsers = new Map<string, string>();

        allLetters.forEach(letter => {
            if (letter.isAnonymous !== true && letter.userId && letter.username) {
                uniqueUsers.set(letter.userId, letter.username);
            }
        });

        // Convert Map to array and add to users
        Array.from(uniqueUsers.entries()).forEach(([userId, username]) => {
            users.push({ id: userId, username });
        });

        // Add any manually selected user filters that weren't included yet
        selectedUserFilters.forEach(user => {
            if (!users.some(u => u.id === user.id)) {
                users.push(user);
            }
        });

        return users;
    };

    // Simplify searchUsers to not cache results
    const searchUsers = useCallback(async (term: string) => {
        if (term.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await unifiedApi.auth.searchUsers(term);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Add debounce for search term changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (userSearchTerm.trim().length >= 2) {
                searchUsers(userSearchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [userSearchTerm, searchUsers]);

    // Update card component to display username
    const renderLetterCard = (letter: { id: string; username: string; content: string; }) => (
        <Card key={letter.id} className="letter-card">
            <CardHeader>
                <CardTitle>{letter.username}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{letter.content}</CardDescription>
            </CardContent>
        </Card>
    );

    // Add a function to handle star clicks
    const handleStarClick = async (letterId: string) => {
        setSelectedLetterId(letterId);
        setIsLoadingLetter(true);

        try {
            const letter = await api.letters.getById(letterId);
            setSelectedLetterData(letter);
        } catch (error) {
            console.error('Error loading letter:', error);
        } finally {
            setIsLoadingLetter(false);
        }
    };

    // Add this to pass to the ConstellationCanvas
    const handleSelectLetter = (id: string) => {
        handleStarClick(id);
    };

    return (
        <div className="constellation-fullscreen" style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            background: 'black'
        }}>
            {/* Use the memoized StarBackground component */}
            <StarBackground />

            {/* Canvas container for stars - needs to be first in the DOM for proper stacking */}
            {!loading && letters.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    overflow: 'hidden',
                    pointerEvents: 'auto' // Ensure interaction with the writing component
                }}>
                    <ConstellationCanvas
                        letters={letters}
                        controlsRef={controlsRef}
                        similarityData={similarityData}
                        onSelectLetter={handleSelectLetter}
                    />
                </div>
            )}

            {/* Overlay for UI elements - positioned above the canvas */}
            <div className="constellation-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 5,
                pointerEvents: 'none' // Let clicks pass through to the 3D canvas by default
            }}>
                {/* Header always visible */}
                <div className="constellation-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    pointerEvents: 'auto', // Make header buttons clickable
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div className="constellation-nav" style={{ display: 'flex', gap: '10px' }}>
                        <Link href="/">
                            <Button variant="secondary" size="sm" className="nav-button" title="Home" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0
                            }}>
                                <Home size={16} />
                            </Button>
                        </Link>

                        <Link href="/writing">
                            <Button variant="primary" size="sm" className="nav-button" title="Write a letter" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0
                            }}>
                                <Pen size={16} />
                            </Button>
                        </Link>

                        {user && (
                            <Link href="/profile">
                                <Button variant="secondary" size="sm" className="nav-button" title="Your profile" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    padding: 0
                                }}>
                                    <User size={16} />
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="constellation-actions" style={{ display: 'flex', gap: '10px' }}>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="nav-button"
                            title="Filter letters"
                            onClick={toggleFilters}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0
                            }}
                        >
                            <Filter size={16} />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="nav-button"
                            title="Information"
                            onClick={toggleInfo}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0
                            }}
                        >
                            <Info size={16} />
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Add the filter panel */}
                {showFilters && (
                    <div className="constellation-filters" style={{
                        position: 'absolute',
                        top: '80px',
                        right: '24px',
                        width: '300px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '8px',
                        padding: '16px',
                        zIndex: 10,
                        pointerEvents: 'auto', // Make filters interactive
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div className="filters-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{ margin: 0 }}>Filter Letters</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="close-filters"
                                onClick={toggleFilters}
                            >
                                <X size={16} />
                            </Button>
                        </div>

                        <div className="filters-section" style={{ marginBottom: '16px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: '8px' }}>By Author</h4>

                            {/* Add search input for users */}
                            <div className="search-container" style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '12px',
                                position: 'relative',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                padding: '6px 10px'
                            }}>
                                <Search size={14} style={{ marginRight: '8px', opacity: 0.7 }} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        width: '100%',
                                        fontSize: '0.8rem',
                                        outline: 'none'
                                    }}
                                />
                                {isSearching && (
                                    <div style={{ position: 'absolute', right: '10px' }}>
                                        <LoadingSpinner size="small" />
                                    </div>
                                )}
                            </div>

                            <div className="filters-content" style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                {/* Show search results when search term exists, otherwise show unique userIds */}
                                {userSearchTerm.trim().length >= 2
                                    ? searchResults.map(user => (
                                        <div key={user.id} style={{ display: 'flex', alignItems: 'center' }}>
                                            <Button
                                                variant={filterByUser === user.id ? "primary" : "outline"}
                                                size="sm"
                                                className="filter-button"
                                                onClick={() => handleFilterByUser(user.username, user.id)}
                                            >
                                                <User size={14} className="mr-1" />
                                                {user.username}
                                            </Button>
                                        </div>
                                    ))
                                    : getUniqueUserIds().map(user => (
                                        <div key={user.id} style={{ display: 'flex', alignItems: 'center' }}>
                                            <Button
                                                variant={filterByUser === user.id ? "primary" : "outline"}
                                                size="sm"
                                                className="filter-button"
                                                onClick={() => handleFilterByUser(user.username, user.id)}
                                            >
                                                <User size={14} className="mr-1" />
                                                {user.username}
                                            </Button>
                                            {/* Show remove button for all except Anonymous */}
                                            {user.username !== 'Anonymous' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeUserFilter(user.id)}
                                                >
                                                    <X size={12} />
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                }

                                {userSearchTerm.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
                                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', padding: '4px' }}>
                                        No users found
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="filters-section" style={{ marginBottom: '16px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: '8px' }}>By Emotion</h4>
                            <div className="filters-content" style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
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
                                    setUserSearchTerm('');
                                    setSearchResults([]);
                                    applyFiltersAndTransform(allLetters);
                                }}
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}

                {showInfo && (
                    <div className="constellation-info" style={{
                        position: 'absolute',
                        top: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        maxWidth: '90%',
                        width: '600px',
                        zIndex: 10,
                        background: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        pointerEvents: 'auto'
                    }}>
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
                    <div className="constellation-controls" style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        display: 'flex',
                        gap: '10px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '8px',
                        padding: '10px',
                        pointerEvents: 'auto'
                    }}>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="control-button"
                            title="Zoom in"
                            onClick={handleZoomIn}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0
                            }}
                        >
                            <ZoomIn size={16} />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="control-button"
                            title="Zoom out"
                            onClick={handleZoomOut}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0
                            }}
                        >
                            <ZoomOut size={16} />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="control-button"
                            title="Reset view"
                            onClick={handleReset}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0
                            }}
                        >
                            <RotateCcw size={16} />
                        </Button>
                    </div>
                )}
            </div>

            {/* Loading state */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    background: 'black',
                    zIndex: 20 // Above everything else when loading
                }}>
                    <LoadingSpinner />
                    <p style={{ marginTop: '16px', color: 'white' }}>Loading constellation...</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && letters.length === 0 && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'black',
                    zIndex: 4
                }}>
                    <div style={{
                        textAlign: 'center',
                        maxWidth: '400px',
                        padding: '24px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '8px'
                    }}>
                        <p style={{ marginBottom: '16px' }}>No letters found in the constellation.</p>
                        <Link href="/writing">
                            <Button>
                                Write the first letter
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Modal for letter view */}
            {selectedLetterId && (
                <div className="letter-modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 100,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backdropFilter: 'blur(5px)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                    <div className="letter-modal"
                        style={{
                            position: 'relative',
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            backgroundColor: 'rgba(10, 10, 20, 0.9)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                            padding: '20px',
                            animation: 'slideUp 0.3s ease-out'
                        }}>
                        <button
                            onClick={() => setSelectedLetterId(null)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(20, 20, 30, 0.6)',
                                transition: 'background-color 0.2s'
                            }}>
                            <XIcon size={20} />
                        </button>

                        {isLoadingLetter ? (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '300px'
                            }}>
                                <LoadingSpinner size="large" />
                            </div>
                        ) : selectedLetterData ? (
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '15px',
                                    borderLeft: `4px solid ${selectedLetterData.color || '#6e44ff'}`,
                                    paddingLeft: '10px'
                                }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                                            {selectedLetterData.isAnonymous === true ? 'Anonymous' : (selectedLetterData.username || 'Unknown User')}
                                        </h3>
                                        {selectedLetterData.emotion && (
                                            <div style={{
                                                fontSize: '0.9rem',
                                                opacity: 0.8,
                                                color: selectedLetterData.color || '#6e44ff'
                                            }}>
                                                Feeling: {selectedLetterData.emotion}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                        {new Date(selectedLetterData.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div style={{
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {selectedLetterData.content}
                                </div>

                                {/* Add similar letters section if available */}
                                <div style={{ marginTop: '30px' }}>
                                    {/* typeof SimilarLetters !== 'undefined' ? (
                                        <SimilarLetters query={selectedLetterId} isLetterId={true} limit={3} threshold={0.6} />
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '15px', opacity: 0.7 }}>
                                            Related letters will appear here
                                        </div>
                                    )} */}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px' }}>
                                Letter not found or an error occurred.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}