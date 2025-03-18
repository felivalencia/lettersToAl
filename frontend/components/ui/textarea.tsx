'use client';

import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    variant?: 'default' | 'outline' | 'ghost';
    error?: boolean;
    label?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({
        variant = 'default',
        error = false,
        label,
        helperText,
        className = '',
        id,
        ...props
    }, ref) => {
        // Generate a unique ID if one isn't provided
        const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

        const baseClass = 'textarea';
        const variantClass = `textarea-${variant}`;
        const errorClass = error ? 'textarea-error' : '';
        const classes = [baseClass, variantClass, errorClass, className].filter(Boolean).join(' ');

        // Function to auto-resize textarea
        const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const textarea = e.target;

            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';

            // Set the height to scrollHeight to fit content
            textarea.style.height = `${textarea.scrollHeight}px`;

            // Call the onChange handler if it exists
            if (props.onChange) {
                props.onChange(e);
            }
        };

        return (
            <div className="textarea-container">
                {label && (
                    <label htmlFor={textareaId} className="textarea-label">
                        {label}
                    </label>
                )}

                <textarea
                    id={textareaId}
                    ref={ref}
                    className={classes}
                    onChange={handleAutoResize}
                    rows={props.rows || 5}
                    {...props}
                />

                {helperText && (
                    <p className={`textarea-helper-text ${error ? 'textarea-helper-error' : ''}`}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea'; 