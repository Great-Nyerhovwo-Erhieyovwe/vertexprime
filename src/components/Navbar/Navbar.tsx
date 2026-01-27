import { motion } from "framer-motion";
import { useState } from "react";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div
                        className="flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                    >
                        <img src="/logo.svg" alt="VertexPrime Capital Logo" className="h-8 w-auto" />
                    </motion.div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <a href="#home" className="text-white hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Home
                            </a>
                            <a href="#markets" className="text-white hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Markets
                            </a>
                            <a href="#platform" className="text-white hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Platform
                            </a>
                            <a href="#about" className="text-white hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                About
                            </a>
                            <a href="#contact" className="text-white hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Contact
                            </a>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:block">
                        <motion.button
                            className="bg-accent text-primary px-4 py-2 rounded-md font-medium hover:bg-accent/90 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Sign In
                        </motion.button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white hover:text-accent p-2"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <motion.div
                        className="md:hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary/95">
                            <a href="#home" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
                                Home
                            </a>
                            <a href="#markets" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
                                Markets
                            </a>
                            <a href="#platform" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
                                Platform
                            </a>
                            <a href="#about" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
                                About
                            </a>
                            <a href="#contact" className="text-white hover:text-accent block px-3 py-2 rounded-md text-base font-medium">
                                Contact
                            </a>
                            <button className="bg-accent text-primary w-full px-3 py-2 rounded-md font-medium mt-4">
                                Sign In
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </nav>
    );
};