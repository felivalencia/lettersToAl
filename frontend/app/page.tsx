import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
                {/* Background stars */}
                <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="star animate-star-pulse"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${Math.max(1, Math.random() * 3)}px`,
                                height: `${Math.max(1, Math.random() * 3)}px`,
                                animationDelay: `${Math.random() * 4}s`
                            }}
                        />
                    ))}
                </div>

                <h1 className="text-5xl md:text-7xl font-serif mb-6 text-center">
                    Letters to Al
                </h1>

                <p className="text-xl md:text-2xl text-center max-w-2xl mb-12 text-opacity-90 leading-relaxed">
                    Write your thoughts to the universe. Watch them join a constellation of shared human experiences.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/writing"
                        className="btn btn-primary text-center"
                    >
                        Write a Letter
                    </Link>

                    <Link
                        href="/constellation"
                        className="btn btn-secondary text-center"
                    >
                        Explore Constellation
                    </Link>
                </div>
            </div>

            <footer className="py-8 text-center text-starlight text-opacity-70">
                <p>
                    A space for human expression, connection, and reflection
                </p>
            </footer>
        </main>
    );
} 