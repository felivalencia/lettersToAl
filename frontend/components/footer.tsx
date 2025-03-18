import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-8 px-6 backdrop-blur-sm border-t border-nebula-purple border-opacity-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                    <p className="text-starlight text-opacity-70 text-sm">
                        Letters to Al &copy; {currentYear}
                    </p>
                    <p className="text-starlight text-opacity-50 text-xs mt-1">
                        A space for human expression, connection, and reflection
                    </p>
                </div>

                <div className="flex space-x-8">
                    <Link
                        href="/about"
                        className="text-starlight text-opacity-70 hover:text-opacity-100 text-sm"
                    >
                        About
                    </Link>
                    <Link
                        href="/privacy"
                        className="text-starlight text-opacity-70 hover:text-opacity-100 text-sm"
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/terms"
                        className="text-starlight text-opacity-70 hover:text-opacity-100 text-sm"
                    >
                        Terms
                    </Link>
                </div>
            </div>
        </footer>
    );
} 