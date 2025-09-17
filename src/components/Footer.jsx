import { Link } from 'react-router-dom';
import { Music, Mail, MapPin, Phone, Facebook, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white p-2 rounded-lg">
                <Music className="h-8 w-8 text-primary-900" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold">Global Mission Wind Band</h3>
                <p className="text-primary-200">Excellence in Musical Performance</p>
              </div>
            </div>
            <p className="text-primary-100 mb-6 max-w-md">
              Bringing the joy of wind ensemble music to our community through
              passionate performances and educational outreach since 1985.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-primary-800 p-2 rounded-lg hover:bg-primary-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-primary-800 p-2 rounded-lg hover:bg-primary-700 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-primary-800 p-2 rounded-lg hover:bg-primary-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-primary-200 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/performances" className="text-primary-200 hover:text-white transition-colors">
                  Performances
                </Link>
              </li>
              <li>
                <Link to="/join" className="text-primary-200 hover:text-white transition-colors">
                  Join Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-200 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-primary-200 hover:text-white transition-colors">
                  Member Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-300 mt-0.5 flex-shrink-0" />
                <div className="text-primary-200">
                  <p>Community Music Center</p>
                  <p>123 Harmony Street</p>
                  <p>Music City, MC 12345</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-300 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-primary-200 hover:text-white transition-colors">
                  (123) 456-7890
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-300 flex-shrink-0" />
                <a href="mailto:info@globalmissionwindband.org" className="text-primary-200 hover:text-white transition-colors">
                  info@globalmissionwindband.org
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-200 text-sm">
              © {currentYear} Global Mission Wind Band. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-primary-200 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-200 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;