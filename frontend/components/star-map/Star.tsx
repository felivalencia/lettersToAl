'use client';

import { useState, useRef } from 'react';
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

    // Base pulse animation
    useFrame((state) => {
        if (meshRef.current) {
            // Subtle pulse animation
            const t = state.clock.getElapsedTime();
            meshRef.current.scale.setScalar(
                size * (1 + Math.sin(t * 2) * 0.05)
            );

            // Add extra pulse when hovered
            if (hovered) {
                meshRef.current.scale.setScalar(
                    size * (1.2 + Math.sin(t * 4) * 0.1)
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
                emissiveIntensity={hovered ? 2 : 1}
            />

            {/* Glow effect */}
            <pointLight
                distance={8}
                intensity={0.8}
                color={color}
            />
        </mesh>
    );
} 