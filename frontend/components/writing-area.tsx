'use client';

import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface WritingAreaProps {
    onSubmit: (content: string, isAnonymous: boolean) => Promise<void>;
}

export default function WritingArea({ onSubmit }: WritingAreaProps) {
    const [letterContent, setLetterContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleSubmit = async () => {
        if (!letterContent.trim()) return;

        try {
            setIsSubmitting(true);
            await onSubmit(letterContent, isAnonymous);
            setLetterContent('');
            setShowConfirmation(true);
            setTimeout(() => setShowConfirmation(false), 3000);
        } catch (error) {
            console.error('Error submitting letter:', error);
            // Handle error here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="writing-area w-full max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif mb-4">Write Your Letter</h2>

            <div className="relative">
                <textarea
                    className="w-full h-64 bg-cosmic-dark bg-opacity-70 border border-nebula-purple border-opacity-50 rounded-lg p-4 text-starlight resize-none focus:outline-none focus:border-nebula-teal transition-colors"
                    placeholder="Dear Universe..."
                    value={letterContent}
                    onChange={(e) => setLetterContent(e.target.value)}
                    disabled={isSubmitting}
                />

                <div className="absolute bottom-3 right-3 text-xs text-starlight text-opacity-50">
                    {letterContent.length} characters
                </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <label className="flex items-center mb-4 sm:mb-0">
                    <input
                        type="checkbox"
                        className="mr-2 h-4 w-4"
                        checked={isAnonymous}
                        onChange={() => setIsAnonymous(!isAnonymous)}
                        disabled={isSubmitting}
                    />
                    <span className="text-sm">
                        Send anonymously
                    </span>
                </label>

                <button
                    onClick={handleSubmit}
                    disabled={!letterContent.trim() || isSubmitting}
                    className={`btn btn-primary flex items-center ${!letterContent.trim() || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {isSubmitting ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <span>Send Letter</span>
                            <Send className="ml-2 h-4 w-4" />
                        </>
                    )}
                </button>
            </div>

            {/* Confirmation message */}
            {showConfirmation && (
                <div className="mt-6 bg-nebula-teal bg-opacity-20 border border-nebula-teal rounded-lg p-4 flex items-center animate-fade-in">
                    <Sparkles className="h-5 w-5 mr-2 text-nebula-teal" />
                    <p>Your letter has joined the constellation. Thank you for sharing.</p>
                </div>
            )}
        </div>
    );
} 