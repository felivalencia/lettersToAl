/**
 * ButtonLink Component
 * 
 * A component that combines the navigation functionality of Next.js Link
 * with the styling of a button for consistent UI elements.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Types for different button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

// Props interface
interface ButtonLinkProps {
    href: string;
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    animate?: boolean;
    icon?: ReactNode;
    external?: boolean;
    onClick?: () => void;
}

/**
 * Button styles for different variants and sizes
 */
const buttonStyles = {
    base: "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-teal",
    variants: {
        primary: "bg-nebula-teal text-cosmic-dark hover:bg-nebula-teal-600",
        secondary: "bg-nebula-purple text-starlight hover:bg-nebula-purple-600",
        outline: "border border-nebula-purple border-opacity-50 bg-transparent hover:bg-nebula-purple hover:bg-opacity-10",
        ghost: "bg-transparent hover:bg-nebula-purple hover:bg-opacity-10",
        link: "bg-transparent underline-offset-4 hover:underline text-nebula-teal"
    },
    sizes: {
        xs: "text-xs px-2 py-1",
        sm: "text-sm px-3 py-1.5",
        md: "text-base px-4 py-2",
        lg: "text-lg px-5 py-2.5"
    }
};

export default function ButtonLink({
    href,
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    animate = true,
    icon,
    external = false,
    onClick
}: ButtonLinkProps) {
    // Combine all the class names
    const classes = [
        buttonStyles.base,
        buttonStyles.variants[variant],
        buttonStyles.sizes[size],
        className
    ].join(' ');

    // Component content with optional icon
    const content = (
        <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </>
    );

    // If external link, use regular anchor
    if (external) {
        return (
            <a
                href={href}
                className={classes}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClick}
            >
                {content}
            </a>
        );
    }

    // If animation is enabled, wrap in motion component
    if (animate) {
        return (
            <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
            >
                <Link href={href} className={classes} onClick={onClick}>
                    {content}
                </Link>
            </motion.div>
        );
    }

    // Default case - simple link with styling
    return (
        <Link href={href} className={classes} onClick={onClick}>
            {content}
        </Link>
    );
} 