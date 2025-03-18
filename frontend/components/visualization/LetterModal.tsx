'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Letter {
    id: string;
    content: string;
    createdAt: string;
    color: string;
}

interface LetterModalProps {
    letter: Letter;
    onClose: () => void;
}

export default function LetterModal({ letter, onClose }: LetterModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Format the date in a poetic way
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        // Poetic time references
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return 'Earlier today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} moons ago`;

        return `${Math.floor(diffDays / 365)} orbits ago`;
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Close on escape key
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    return (
        <div className="letter-modal">
            <motion.div
                ref={modalRef}
                className="letter-content relative"
                style={{
                    borderColor: letter.color,
                    boxShadow: `0 0 30px ${letter.color}30`
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                }}
            >
                <button
                    className="absolute top-4 right-4 text-starlight opacity-70 hover:opacity-100 transition-opacity duration-300"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-6 flex items-center space-x-2">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{
                            backgroundColor: letter.color,
                            boxShadow: `0 0 8px ${letter.color}`
                        }}
                    />
                    <div className="text-sm text-starlight opacity-70 font-serif italic">
                        {formatDate(letter.createdAt)}
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-line leading-relaxed text-starlight">
                        {letter.content}
                    </p>
                </div>

                <div className="mt-6 pt-4 border-t border-starlight border-opacity-10 text-xs text-starlight opacity-50 text-right italic">
                    "Words cast into the cosmos"
                </div>
            </motion.div>
        </div>
    );
} 