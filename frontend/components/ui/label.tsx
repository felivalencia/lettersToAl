'use client';

import React, { forwardRef } from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    className?: string;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
    ({ className = '', ...props }, ref) => {
        const classes = ['form-label', className].filter(Boolean).join(' ');

        return (
            <label
                ref={ref}
                className={classes}
                {...props}
            />
        );
    }
);

Label.displayName = 'Label'; 