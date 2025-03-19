import { useRef, useState, useCallback, useEffect, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Billboard, Line } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { Vector3, Object3D, LineBasicMaterial, Color } from 'three';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type StarProps = {
    position: [number, number, number];
    color: string;
    size: number;
    id: string;
    username: string;
    emotion?: string;
    connections: Array<{
        position: [number, number, number];
        similarity?: number;
    }>;
    onHover: (id: string, username: string, emotion: string | undefined, position: [number, number, number], isHovered: boolean) => void;
};

const Star = ({ position, color, size, id, username, emotion, connections, onHover }: StarProps) => {
    const router = useRouter();
    const [hovered, setHovered] = useState(false);
    const starRef = useRef<THREE.Mesh>(null);

    // Simplified scaling without animation to avoid blur
    const scale = hovered ? 1.5 : 1;
    const emissiveIntensity = hovered ? 2.0 : 1.2;

    const handleClick = useCallback(() => {
        router.push(`/letters/${id}`);
    }, [router, id]);

    // Handle hover state
    const handlePointerOver = () => {
        setHovered(true);
        onHover(id, username, emotion, position, true);
    };

    const handlePointerOut = () => {
        setHovered(false);
        onHover(id, username, emotion, position, false);
    };

    return (
        <group>
            {/* Connections to other stars */}
            {connections.map((connection, index) => {
                // Calculate line properties based on similarity
                const similarity = connection.similarity || 0;
                const lineWidth = 0.3 + (similarity * 0.7); // 0.3 to 1.0 based on similarity
                const opacity = 0.1 + (similarity * 0.4); // 0.1 to 0.5 based on similarity

                return (
                    <Line
                        key={`connection-${index}`}
                        points={[position, connection.position]}
                        color={color}
                        lineWidth={lineWidth}
                        opacity={opacity}
                        transparent
                        dashed={false}
                    />
                );
            })}

            <mesh
                ref={starRef}
                position={position}
                scale={scale}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <sphereGeometry args={[size * 0.01, 64, 64]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity}
                    toneMapped={false}
                    roughness={0.1}
                    metalness={0.2}
                />
            </mesh>

            {/* Add a point light for better glow effect */}
            {hovered && (
                <pointLight
                    distance={12}
                    intensity={0.7}
                    color={color}
                    position={position}
                />
            )}
        </group>
    );
};

// Utility for projecting 3D position to screen coordinates
const useStarPosition = (
    position: [number, number, number] | null,
    hoveredId: string | null
) => {
    const { camera, size } = useThree();
    const [screenPosition, setScreenPosition] = useState<{ x: number, y: number } | null>(null);

    useFrame(() => {
        if (position && hoveredId) {
            // Convert 3D position to screen coordinates
            const vector = new Vector3(position[0], position[1], position[2]);
            vector.project(camera);

            // Convert normalized device coordinates (-1 to +1) to screen space
            const x = (vector.x * 0.5 + 0.5) * size.width;
            const y = (-(vector.y * 0.5) + 0.5) * size.height;

            setScreenPosition({ x, y });
        }
    });

    return screenPosition;
};

// ScreenPositionTracker is a component to track a star's position on screen
const ScreenPositionTracker = ({
    hoveredStar,
    onUpdatePosition
}: {
    hoveredStar: { id: string, position: [number, number, number] } | null,
    onUpdatePosition: (position: { x: number, y: number } | null) => void
}) => {
    const screenPosition = useStarPosition(
        hoveredStar?.position || null,
        hoveredStar?.id || null
    );

    useEffect(() => {
        onUpdatePosition(screenPosition);
    }, [screenPosition, onUpdatePosition]);

    return null;
};

const Scene = ({
    starData,
    orbitControlsRef,
    onStarHover,
    hoveredStar,
    onUpdatePosition,
    similarityData
}: {
    starData: Array<any>,
    orbitControlsRef: React.RefObject<any>,
    onStarHover: (id: string, username: string, emotion: string | undefined, position: [number, number, number], isHovered: boolean) => void,
    hoveredStar: { id: string, username: string, emotion?: string, position: [number, number, number] } | null,
    onUpdatePosition: (position: { x: number, y: number } | null) => void,
    similarityData?: Record<string, Array<{ id: string, similarity: number }>>
}) => {
    const { camera, gl } = useThree();
    const starsGroup = useRef<THREE.Group>(null);

    // Calculate connections between stars
    const starsWithConnections = useMemo(() => {
        // Calculate maximum connections based on number of stars
        // Fewer connections when there are many stars to prevent UI clutter
        const maxConnections = starData.length > 30 ? 1 : (starData.length > 15 ? 2 : 3);
        const connectionThreshold = starData.length > 30 ? 0.3 : 0.5; // Smaller threshold for many stars

        return starData.map((star, index) => {
            const connections: Array<{
                position: [number, number, number];
                similarity?: number;
            }> = [];

            // Priority 1: Add connections based on similarity data if available
            if (similarityData && similarityData[star.id]) {
                // Find similar letters
                const similarLetters = similarityData[star.id];

                // For each similar letter, find its corresponding star data and add connection
                similarLetters.forEach(similarLetter => {
                    // Skip self connections
                    if (similarLetter.id === star.id) return;

                    // Find the star data for this letter
                    const targetStar = starData.find(s => s.id === similarLetter.id);
                    if (targetStar) {
                        connections.push({
                            position: [targetStar.x * 1.5, targetStar.y * 1.5, targetStar.z * 1.5],
                            similarity: similarLetter.similarity
                        });
                    }
                });

                // Sort by similarity and limit to avoid clutter
                connections.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

                // If we have connections from similarity data, use them and skip proximity-based connections
                if (connections.length > 0) {
                    return {
                        ...star,
                        connections: connections.slice(0, maxConnections * 2) // Allow more connections for similarity-based
                    };
                }
            }

            // Priority 2: Fall back to proximity-based connections if no similarity data available
            starData.forEach((otherStar, otherIndex) => {
                if (index !== otherIndex) {
                    const distance = Math.sqrt(
                        Math.pow(star.x * 1.5 - otherStar.x * 1.5, 2) +
                        Math.pow(star.y * 1.5 - otherStar.y * 1.5, 2) +
                        Math.pow(star.z * 1.5 - otherStar.z * 1.5, 2)
                    );

                    // If stars are close enough, create a connection
                    // For proximity-based connections, similarity is proportional to closeness
                    if (distance < connectionThreshold) {
                        const proximitySimilarity = 1 - (distance / connectionThreshold); // 0-1 similarity based on distance
                        connections.push({
                            position: [otherStar.x * 1.5, otherStar.y * 1.5, otherStar.z * 1.5],
                            similarity: proximitySimilarity
                        });
                    }
                }
            });

            // Limit connections to avoid visual clutter
            return {
                ...star,
                connections: connections.slice(0, maxConnections)
            };
        });
    }, [starData, similarityData]);

    // Set initial camera position and force pixel ratio
    useEffect(() => {
        camera.position.set(0, 0, 2);
        camera.updateProjectionMatrix();

        // Force a high-quality pixel ratio to avoid blur
        gl.setPixelRatio(2);

        // Disable auto-clear to prevent flickering
        gl.autoClear = false;
    }, [camera, gl]);

    // Single useFrame to optimize rendering
    useFrame(() => {
        // Clear manually for better control
        gl.clear();

        // No animations or continuous rotation here to prevent blur
    });

    return (
        <group ref={starsGroup}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={0}
            />

            {starsWithConnections.map((star) => (
                <Star
                    key={star.id}
                    id={star.id}
                    position={[star.x * 1.5, star.y * 1.5, star.z * 1.5]}
                    color={star.color}
                    size={star.size}
                    username={star.username}
                    emotion={star.emotion}
                    connections={star.connections}
                    onHover={onStarHover}
                />
            ))}

            <OrbitControls
                ref={orbitControlsRef}
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                zoomSpeed={0.6}
                panSpeed={0.5}
                rotateSpeed={0.5}
                dampingFactor={0.1}
            />

            {/* Track the position of the hovered star */}
            {hoveredStar && (
                <ScreenPositionTracker
                    hoveredStar={hoveredStar}
                    onUpdatePosition={onUpdatePosition}
                />
            )}
        </group>
    );
};

// Export a type definition for the controls API
export type ConstellationControlsRef = {
    resetCamera: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    rotateTo: (x: number, y: number, z: number) => void;
};

interface ConstellationCanvasProps {
    letters: Array<{
        id: string;
        x: number;
        y: number;
        z: number;
        size: number;
        color: string;
        content: string;
        username: string;
        emotion?: string;
    }>;
    controlsRef?: React.RefObject<ConstellationControlsRef>;
    similarityData?: Record<string, Array<{ id: string, similarity: number }>>;
}

export function ConstellationCanvas({ letters, controlsRef, similarityData = {} }: ConstellationCanvasProps) {
    const [hoveredStar, setHoveredStar] = useState<{ id: string, username: string, emotion?: string, position: [number, number, number] } | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const orbitControlsRef = useRef<OrbitControlsImpl>(null);

    // Stop any processes that might be running in the background
    useEffect(() => {
        // Apply styles to the HTML element to prevent any scaling issues
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        // Force high-quality rendering for the entire document
        document.body.style.textRendering = 'optimizeLegibility';
        (document.body.style as any).webkitFontSmoothing = 'antialiased';
        (document.body.style as any).mozOsxFontSmoothing = 'grayscale';

        return () => {
            // Clean up on unmount
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.textRendering = '';
            (document.body.style as any).webkitFontSmoothing = '';
            (document.body.style as any).mozOsxFontSmoothing = '';
        };
    }, []);

    const handleStarHover = useCallback((id: string, username: string, emotion: string | undefined, position: [number, number, number], isHovered: boolean) => {
        if (isHovered) {
            setHoveredStar({ id, username, emotion, position });
        } else {
            setHoveredStar(prev => prev?.id === id ? null : prev);
        }
    }, []);

    const handleUpdatePosition = useCallback((position: { x: number, y: number } | null) => {
        setTooltipPosition(position);
    }, []);

    // Forward control methods to parent component
    useImperativeHandle(controlsRef, () => ({
        resetCamera: () => {
            if (orbitControlsRef.current) {
                orbitControlsRef.current.reset();
            }
        },
        zoomIn: () => {
            if (orbitControlsRef.current) {
                // Manually adjust zoom by modifying the camera position
                const cameraPosition = orbitControlsRef.current.object.position.clone();
                const zoomDirection = new Vector3(0, 0, 0).sub(cameraPosition).normalize();
                orbitControlsRef.current.object.position.addScaledVector(zoomDirection, 0.5);
                orbitControlsRef.current.update();
            }
        },
        zoomOut: () => {
            if (orbitControlsRef.current) {
                // Manually adjust zoom by modifying the camera position
                const cameraPosition = orbitControlsRef.current.object.position.clone();
                const zoomDirection = new Vector3(0, 0, 0).sub(cameraPosition).normalize();
                orbitControlsRef.current.object.position.addScaledVector(zoomDirection, -0.5);
                orbitControlsRef.current.update();
            }
        },
        rotateTo: (x: number, y: number, z: number) => {
            if (orbitControlsRef.current) {
                orbitControlsRef.current.object.position.set(x, y, z);
                orbitControlsRef.current.update();
            }
        }
    }), []);

    return (
        <div
            className="constellation-canvas"
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100vh',
                position: 'absolute',
                top: 0,
                left: 0,
                overflow: 'hidden',
                backgroundColor: 'black',
                imageRendering: 'crisp-edges' as any
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 2], fov: 50, near: 0.1, far: 1000 }}
                style={{
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    imageRendering: 'crisp-edges' as any
                }}
                dpr={window.devicePixelRatio || 2}
                gl={{
                    antialias: true,
                    powerPreference: 'high-performance',
                    precision: 'highp',
                    pixelRatio: window.devicePixelRatio || 2
                }}
                frameloop="demand"
            >
                <Scene
                    starData={letters}
                    orbitControlsRef={orbitControlsRef}
                    onStarHover={handleStarHover}
                    hoveredStar={hoveredStar}
                    onUpdatePosition={handleUpdatePosition}
                    similarityData={similarityData}
                />
            </Canvas>

            {/* Tooltip that follows hovered star */}
            {hoveredStar && tooltipPosition && (
                <div
                    className="star-tooltip"
                    style={{
                        position: 'fixed',
                        top: `${Math.floor(tooltipPosition.y)}px`,
                        left: `${Math.floor(tooltipPosition.x)}px`,
                        transform: 'translate(-50%, -130%)',
                        padding: '8px 12px',
                        background: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                        color: 'white',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        fontWeight: '400',
                        willChange: 'transform',
                        imageRendering: 'crisp-edges' as any
                    }}
                >
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
                        {hoveredStar.username}
                    </p>
                    {hoveredStar.emotion && (
                        <p style={{ margin: '0', opacity: 0.9 }}>
                            {hoveredStar.emotion}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
} 