'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface WritingAreaProps {
    onSubmit: (content: string, isAnonymous: boolean) => Promise<void>;
}

export default function WritingArea({ onSubmit }: WritingAreaProps) {
    const [letterContent, setLetterContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Add subtle focus to textarea after component loads
        setTimeout(() => {
            if (textAreaRef.current) {
                textAreaRef.current.focus();
            }
        }, 500);
    }, []);

    const handleSubmit = async () => {
        if (!letterContent.trim()) return;

        try {
            setIsSubmitting(true);
            await onSubmit(letterContent, isAnonymous);
            setLetterContent('');
            setShowConfirmation(true);
            setTimeout(() => setShowConfirmation(false), 4000);
        } catch (error) {
            console.error('Error submitting letter:', error);
            // Handle error here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className="writing-area w-full max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="relative">
                <textarea
                    ref={textAreaRef}
                    className="w-full h-64 bg-cosmic-dark bg-opacity-70 border border-nebula-purple border-opacity-50 rounded-lg p-4 text-starlight resize-none focus:outline-none focus:border-nebula-teal focus:ring-1 focus:ring-nebula-teal transition-all duration-300"
                    placeholder="Dear Universe..."
                    value={letterContent}
                    onChange={(e) => setLetterContent(e.target.value)}
                    disabled={isSubmitting}
                />

                <div className="absolute bottom-3 right-3 text-xs text-starlight opacity-50">
                    {letterContent.length} characters
                </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <label className="flex items-center mb-4 sm:mb-0 cursor-pointer group">
                    <div className="relative mr-2 h-4 w-4">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={isAnonymous}
                            onChange={() => setIsAnonymous(!isAnonymous)}
                            disabled={isSubmitting}
                        />
                        <div className={`absolute inset-0 rounded-sm transition-colors duration-200 border ${isAnonymous ? 'bg-nebula-teal bg-opacity-20 border-nebula-teal' : 'bg-transparent border-nebula-purple border-opacity-50'}`}></div>
                        {isAnonymous && (
                            <svg className="absolute inset-0 h-4 w-4 text-nebula-teal" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.5 8.5L6.5 11.5L12.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <span className="text-sm group-hover:text-nebula-teal transition-colors duration-200">
                        Send anonymously
                    </span>
                </label>

                <motion.button
                    onClick={handleSubmit}
                    disabled={!letterContent.trim() || isSubmitting}
                    className={`btn btn-primary flex items-center ${!letterContent.trim() || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                >
                    {isSubmitting ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-starlight" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        <>
                            <span>Send Letter</span>
                            <Send className="ml-2 h-4 w-4" />
                        </>
                    )}
                </motion.button>
            </div>

            {/* Confirmation message */}
            {showConfirmation && (
                <motion.div
                    className="mt-6 bg-nebula-teal bg-opacity-20 border border-nebula-teal rounded-lg p-4 flex items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <Sparkles className="h-5 w-5 mr-2 text-nebula-teal" />
                    <p>Your letter has joined the constellation. Thank you for sharing.</p>
                </motion.div>
            )}
        </motion.div>
    );
} 