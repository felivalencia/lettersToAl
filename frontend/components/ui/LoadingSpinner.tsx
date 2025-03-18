'use client';

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    className?: string;
}

export function LoadingSpinner({
    size = 'medium',
    color = 'var(--color-primary)',
    className = '',
}: LoadingSpinnerProps) {
    const sizeMap = {
        small: '1.5rem',
        medium: '2.5rem',
        large: '3.5rem',
    };

    const spinnerSize = sizeMap[size];

    return (
        <div
            className={`loading-spinner ${className}`}
            style={{
                width: spinnerSize,
                height: spinnerSize,
                borderColor: `${color}20`,
                borderTopColor: color,
            }}
            aria-label="Loading"
            role="status"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
} 