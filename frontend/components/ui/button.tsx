'use client';

import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    children: React.ReactNode;
    className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', children, className = '', ...props }, ref) => {
        const baseClass = 'button';
        const variantClass = `button-${variant}`;
        const sizeClass = `button-${size}`;
        const classes = [baseClass, variantClass, sizeClass, className].filter(Boolean).join(' ');

        return (
            <button
                ref={ref}
                className={classes}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button'; 