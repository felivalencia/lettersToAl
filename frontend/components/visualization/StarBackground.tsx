'use client'

import { useEffect, useState } from 'react'

interface Star {
    id: number
    x: number
    y: number
    size: number
    opacity: number
    blinkSpeed: number
}

interface StarBackgroundProps {
    stars?: number
}

export function StarBackground({ stars = 100 }: StarBackgroundProps) {
    const [starPoints, setStarPoints] = useState<Star[]>([])

    useEffect(() => {
        // Generate random stars
        const generatedStars: Star[] = []

        for (let i = 0; i < stars; i++) {
            generatedStars.push({
                id: i,
                x: Math.random() * 100, // % of width
                y: Math.random() * 100, // % of height
                size: Math.random() * 0.2 + 0.1, // 0.1rem to 0.3rem
                opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
                blinkSpeed: Math.random() * 4 + 2 // 2s to 6s
            })
        }

        setStarPoints(generatedStars)
    }, [stars])

    return (
        <>
            {starPoints.map((star) => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}rem`,
                        height: `${star.size}rem`,
                        opacity: star.opacity,
                        animation: `blink ${star.blinkSpeed}s infinite alternate`
                    }}
                />
            ))}
        </>
    )
} 