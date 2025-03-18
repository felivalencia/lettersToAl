'use client';

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: 'default' | 'outline' | 'ghost';
    error?: boolean;
    className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
        variant = 'default',
        error = false,
        className = '',
        ...props
    }, ref) => {
        const baseClass = 'input';
        const variantClass = `input-${variant}`;
        const errorClass = error ? 'input-error' : '';
        const classes = [baseClass, variantClass, errorClass, className].filter(Boolean).join(' ');

        return (
            <input
                ref={ref}
                className={classes}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input'; 