'use client';

import { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarProps {
    position: [number, number, number];
    color: string;
    size: number;
    onClick: () => void;
}

export function Star({ position, color, size, onClick }: StarProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);

    // Subtle entrance animation
    const [scale, setScale] = useState(0);
    useEffect(() => {
        // Stagger entrance animation
        const timer = setTimeout(() => {
            setScale(1);
        }, Math.random() * 1000);

        return () => clearTimeout(timer);
    }, []);

    // Base pulse animation with improved subtlety
    useFrame((state) => {
        if (meshRef.current) {
            // Get normalized time for animation
            const t = state.clock.getElapsedTime();

            // Create a more organic, less mechanical pulse
            const basePulse = Math.sin(t * 1.5) * 0.03 + Math.sin(t * 0.7) * 0.02;

            // Add subtle movement
            meshRef.current.position.x += Math.sin(t * 0.2 + position[0]) * 0.0001;
            meshRef.current.position.y += Math.cos(t * 0.3 + position[1]) * 0.0001;

            // Apply scale based on state
            if (hovered) {
                // More dynamic pulse when hovered
                meshRef.current.scale.setScalar(
                    size * (1.2 + basePulse * 2)
                );
            } else {
                // Subtle pulse when not hovered
                meshRef.current.scale.setScalar(
                    size * (scale + basePulse)
                );
            }
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                setClicked(!clicked);
                onClick();
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
                setHovered(false);
                document.body.style.cursor = 'auto';
            }}
        >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={hovered ? 1.8 : 1.2}
                transparent={true}
                opacity={0.9}
            />

            {/* Glow effect with more subtlety */}
            <pointLight
                distance={hovered ? 12 : 8}
                intensity={hovered ? 0.7 : 0.5}
                color={color}
            />
        </mesh>
    );
} 