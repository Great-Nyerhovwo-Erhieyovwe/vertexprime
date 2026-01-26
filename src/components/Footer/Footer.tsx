import { FaFacebookF, FaTwitter, FaLinkedinIn, FaTelegramPlane } from "react-icons/fa";

export const Footer = () => (
    <footer className="bg-primary py-8">
        <div className="mx-auto max-w-6xl px-4 text-white">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Company info */}
                <div>
                    <h4 className="mb-2 font-semibold">VertexPrime Capital</h4>
                    <p className="text-sm">
                        © {new Date().getFullYear()} VertexPrime Capital. All rights reserved.
                    </p>
                    <p className="text-sm">
                        Risk Disclaimer: Trading involves risk. Do not invest money you cannot
                        afford to lose.
                    </p>
                </div>

                {/* Quick links */}
                <div>
                    <h4 className="mb-2 font-semibold">Quick Links</h4>
                    <ul className="space-y-1 text-sm">
                        <li><a href="#" className="hover:text-accent">About Us</a></li>
                        <li><a href="#" className="hover:text-accent">Support</a></li>
                        <li><a href="#" className="hover:text-accent">Legal</a></li>
                        <li><a href="#" className="hover:text-accent">Contact</a></li>
                    </ul>
                </div>

                {/* Social icons */}
                <div className="flex items-center space-x-4">
                    <a href="#" className="text-white hover:text-accent"><FaFacebookF size={20} /></a>
                    <a href="#" className="text-white hover:text-accent"><FaTwitter size={20} /></a>
                    <a href="#" className="text-white hover:text-accent"><FaLinkedinIn size={20} /></a>
                    <a href="#" className="text-white hover:text-accent"><FaTelegramPlane size={20} /></a>
                </div>
            </div>
        </div>
    </footer>
);