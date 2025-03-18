import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
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
    connections: Array<[number, number, number]>;
    onHover: (id: string, username: string, emotion: string | undefined, position: [number, number, number], isHovered: boolean) => void;
};

const Star = ({ position, color, size, id, username, emotion, connections, onHover }: StarProps) => {
    const router = useRouter();
    const [hovered, setHovered] = useState(false);
    const starRef = useRef<THREE.Mesh>(null);

    // Animation for hover effect
    const { scale, emissive } = useSpring({
        scale: hovered ? 1.5 : 1,
        emissive: hovered ? 0.5 : 0.2,
        config: { tension: 300, friction: 10 }
    });

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

    useFrame(() => {
        if (starRef.current) {
            // Add a subtle pulsing effect
            starRef.current.rotation.y += 0.003;
            starRef.current.rotation.z += 0.001;
        }
    });

    return (
        <group>
            {/* Connections to other stars */}
            {connections.map((targetPos, index) => (
                <Line
                    key={`connection-${index}`}
                    points={[position, targetPos]}
                    color={color}
                    lineWidth={0.5}
                    opacity={0.3}
                    transparent
                    dashed={false}
                />
            ))}

            <animated.mesh
                ref={starRef}
                position={position}
                scale={scale}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <sphereGeometry args={[size * 0.01, 16, 16]} />
                <animated.meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissive}
                    toneMapped={false}
                />
            </animated.mesh>
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
    onUpdatePosition
}: {
    starData: Array<any>,
    orbitControlsRef: React.RefObject<any>,
    onStarHover: (id: string, username: string, emotion: string | undefined, position: [number, number, number], isHovered: boolean) => void,
    hoveredStar: { id: string, username: string, emotion?: string, position: [number, number, number] } | null,
    onUpdatePosition: (position: { x: number, y: number } | null) => void
}) => {
    const { camera } = useThree();
    const starsGroup = useRef<THREE.Group>(null);

    // Calculate connections between stars
    const starsWithConnections = useMemo(() => {
        // Calculate maximum connections based on number of stars
        // Fewer connections when there are many stars to prevent UI clutter
        const maxConnections = starData.length > 30 ? 1 : (starData.length > 15 ? 2 : 3);
        const connectionThreshold = starData.length > 30 ? 0.3 : 0.5; // Smaller threshold for many stars

        return starData.map((star, index) => {
            const connections: Array<[number, number, number]> = [];

            // Find stars that are close by (using Euclidean distance)
            starData.forEach((otherStar, otherIndex) => {
                if (index !== otherIndex) {
                    const distance = Math.sqrt(
                        Math.pow(star.x * 1.5 - otherStar.x * 1.5, 2) +
                        Math.pow(star.y * 1.5 - otherStar.y * 1.5, 2) +
                        Math.pow(star.z * 1.5 - otherStar.z * 1.5, 2)
                    );

                    // If stars are close enough, create a connection
                    if (distance < connectionThreshold) {
                        connections.push([otherStar.x * 1.5, otherStar.y * 1.5, otherStar.z * 1.5]);
                    }
                }
            });

            // Limit connections to avoid visual clutter
            return {
                ...star,
                connections: connections.slice(0, maxConnections)
            };
        });
    }, [starData]);

    // Set initial camera position
    useEffect(() => {
        camera.position.set(0, 0, 2);
    }, [camera]);

    return (
        <group ref={starsGroup}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />

            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
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
}

export function ConstellationCanvas({ letters, controlsRef }: ConstellationCanvasProps) {
    const orbitControlsRef = useRef<OrbitControlsImpl>(null);
    const [hoveredStar, setHoveredStar] = useState<{
        id: string;
        username: string;
        emotion?: string;
        position: [number, number, number];
    } | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null);

    // Handle star hover
    const handleStarHover = useCallback((
        id: string,
        username: string,
        emotion: string | undefined,
        position: [number, number, number],
        isHovered: boolean
    ) => {
        if (isHovered) {
            setHoveredStar({
                id,
                username,
                emotion,
                position
            });
        } else {
            if (hoveredStar && hoveredStar.id === id) {
                setHoveredStar(null);
                setTooltipPosition(null);
            }
        }
    }, [hoveredStar]);

    // Update tooltip position when star position changes
    const handleUpdatePosition = useCallback((position: { x: number, y: number } | null) => {
        // If position is valid, ensure tooltip stays within viewport boundaries
        if (position) {
            // Add boundary check to prevent tooltip from going off-screen
            const boundedPosition = {
                x: Math.min(Math.max(position.x, 120), window.innerWidth - 120),
                y: Math.max(position.y, 80) // Ensure tooltip is not too close to the top
            };
            setTooltipPosition(boundedPosition);
        } else {
            setTooltipPosition(null);
        }
    }, []);

    // Expose camera control methods to parent component
    useImperativeHandle(controlsRef, () => ({
        resetCamera: () => {
            if (orbitControlsRef.current) {
                // Use a type guard to check if reset method exists
                const controls = orbitControlsRef.current;
                if (typeof controls.reset === 'function') {
                    controls.reset();
                }
            }
        },
        zoomIn: () => {
            if (orbitControlsRef.current) {
                const controls = orbitControlsRef.current;
                if (typeof controls.dollyIn === 'function') {
                    controls.dollyIn(1.2);
                    controls.update();
                }
            }
        },
        zoomOut: () => {
            if (orbitControlsRef.current) {
                const controls = orbitControlsRef.current;
                if (typeof controls.dollyOut === 'function') {
                    controls.dollyOut(1.2);
                    controls.update();
                }
            }
        },
        rotateTo: (x: number, y: number, z: number) => {
            if (orbitControlsRef.current) {
                const controls = orbitControlsRef.current;
                if (controls.target) {
                    controls.target.set(x, y, z);
                    controls.update();
                }
            }
        }
    }), [orbitControlsRef]);

    return (
        <div className="constellation-canvas">
            <Canvas
                dpr={[1, 2]}
                camera={{ position: [0, 0, 2], fov: 60 }}
                style={{ background: 'radial-gradient(circle at center, #0c0e1a, #000000)' }}
            >
                <Scene
                    starData={letters}
                    orbitControlsRef={orbitControlsRef}
                    onStarHover={handleStarHover}
                    hoveredStar={hoveredStar}
                    onUpdatePosition={handleUpdatePosition}
                />
            </Canvas>

            {/* HTML-based tooltip positioned based on star's screen coordinates */}
            {hoveredStar && tooltipPosition && (
                <div
                    className="star-tooltip"
                    style={{
                        position: 'absolute',
                        top: `${tooltipPosition.y - 20}px`,
                        left: `${tooltipPosition.x}px`,
                        transform: 'translate(-50%, -100%)',
                        zIndex: 100,
                        opacity: 0.95,
                    }}
                >
                    <div>Letter by <strong>{hoveredStar.username}</strong></div>
                    {hoveredStar.emotion && (
                        <div className="tooltip-emotion">
                            Emotion: <span className="emotion-label">{hoveredStar.emotion}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 