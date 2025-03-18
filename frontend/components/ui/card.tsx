'use client';

import * as React from 'react';

// Card component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={`card ${className || ''}`}
            {...props}
        />
    );
}

// Card Header component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export function CardHeader({ className, ...props }: CardHeaderProps) {
    return (
        <div
            className={`card-header ${className || ''}`}
            {...props}
        />
    );
}

// Card Title component
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

export function CardTitle({ className, ...props }: CardTitleProps) {
    return (
        <h3
            className={`card-title ${className || ''}`}
            {...props}
        />
    );
}

// Card Description component
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

export function CardDescription({ className, ...props }: CardDescriptionProps) {
    return (
        <p
            className={`card-description ${className || ''}`}
            {...props}
        />
    );
}

// Card Content component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export function CardContent({ className, ...props }: CardContentProps) {
    return (
        <div
            className={`card-content ${className || ''}`}
            {...props}
        />
    );
}

// Card Footer component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

export function CardFooter({ className, ...props }: CardFooterProps) {
    return (
        <div
            className={`card-footer ${className || ''}`}
            {...props}
        />
    );
} 