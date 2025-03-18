'use client';

import * as React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ checked, onCheckedChange, className = '', ...props }, ref) => {
        const classes = ['switch-container', className].filter(Boolean).join(' ');

        return (
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                data-state={checked ? 'checked' : 'unchecked'}
                className={classes}
                onClick={() => onCheckedChange(!checked)}
            >
                <span className="switch-thumb" />
                <input
                    type="checkbox"
                    ref={ref}
                    checked={checked}
                    onChange={(e) => onCheckedChange(e.target.checked)}
                    className="switch-input"
                    {...props}
                />
            </button>
        );
    }
);

Switch.displayName = 'Switch'; 