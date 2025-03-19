'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Star } from './Star';
import LetterModal from './LetterModal';

interface StarData {
    id: string;
    position: [number, number, number];
    color: string;
    size: number;
    content: string;
    createdAt: string;
}

// Temporary mock data until API is connected
const MOCK_STARS: StarData[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `star-${i}`,
    position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
    ] as [number, number, number],
    color: ['#6e44ff', '#4285f4', '#36bfb1', '#ff66c4', '#ff9e44'][
        Math.floor(Math.random() * 5)
    ],
    size: Math.random() * 0.5 + 0.2,
    content: `Letter #${i}: This is a placeholder for letter content. In the real application, this would be actual content from users.`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
}));

export default function StarMap() {
    const controlsRef = useRef(null);
    const [stars, setStars] = useState<StarData[]>(MOCK_STARS);
    const [selectedLetter, setSelectedLetter] = useState<StarData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading data from API
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);

        // In a real app, we'd fetch data here:
        // const fetchLetters = async () => {
        //   try {
        //     const response = await fetch('/api/letters/map');
        //     const data = await response.json();
        //     setStars(data);
        //   } catch (error) {
        //     console.error('Error fetching star map data:', error);
        //   } finally {
        //     setIsLoading(false);
        //   }
        // };
        // 
        // fetchLetters();
    }, []);

    const handleStarClick = (star: StarData) => {
        setSelectedLetter(star);
    };

    const closeModal = () => {
        setSelectedLetter(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl">Loading star map...</p>
            </div>
        );
    }

    return (
        <>
            <Canvas
                camera={{ position: [0, 0, 15], fov: 60 }}
                className="!touch-auto"
            >
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                {/* Background stars */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Letter stars */}
                {stars.map((star) => (
                    <Star
                        key={star.id}
                        position={star.position}
                        color={star.color}
                        size={star.size}
                        onClick={() => handleStarClick(star)}
                    />
                ))}

                <OrbitControls
                    ref={controlsRef}
                    enableDamping
                    dampingFactor={0.05}
                    rotateSpeed={0.5}
                    zoomSpeed={0.8}
                    minDistance={5}
                    maxDistance={50}
                />
            </Canvas>

            {/* Information overlay */}
            <div className="absolute top-4 right-4 bg-cosmic-dark bg-opacity-70 p-3 rounded-lg text-sm z-10">
                <p>Stars: {stars.length}</p>
                <p className="text-xs mt-1 text-opacity-70">Drag to rotate. Scroll to zoom.</p>
            </div>

            {/* Letter modal */}
            {selectedLetter && (
                <LetterModal
                    letter={selectedLetter}
                    onClose={closeModal}
                />
            )}
        </>
    );
} 