import { Link } from 'react-router-dom';
import { Music, Mail, Facebook, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Brand Section - Compact */}
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-white">Global Mission Wind Band</h3>
              <p className="text-gray-300 text-sm">Excellence in Musical Performance</p>
            </div>
          </div>

          {/* Quick Navigation */}
          <nav className="flex flex-wrap gap-6 md:gap-8">
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              About
            </Link>
            <Link to="/performances" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Concerts
            </Link>
            <Link to="/join" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Join Us
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Contact
            </Link>
          </nav>

          {/* Social Media & Contact */}
          <div className="flex items-center space-x-4">
            <a href="mailto:info@globalmissionwindband.org" className="text-gray-300 hover:text-white transition-colors">
              <Mail className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="YouTube">
              <Youtube className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Minimal */}
      <div className="border-t border-white/10">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs">
              © {currentYear} Global Mission Wind Band. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-300 text-xs transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300 text-xs transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;