import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Performances', href: '/performances' },
      { name: 'Gallery', href: '/gallery' },
    ],
    secondary: [
      { name: 'Join Us', href: '/join' },
      { name: 'Contact', href: '/contact' },
    ],
  };

  return (
    <footer className="border-t border-gray-100">
      <div className="container-main py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src="/logo.png"
                alt="GMWB"
                className="h-8 w-8 object-contain"
              />
              <span className="font-semibold text-gray-900">GMWB</span>
            </Link>
            <p className="text-small text-gray-500 max-w-xs">
              Excellence in musical performance since 2025.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-small font-medium text-gray-900 mb-3">Navigate</h4>
            <ul className="space-y-2">
              {links.main.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-small text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-small font-medium text-gray-900 mb-3">Get Involved</h4>
            <ul className="space-y-2">
              {links.secondary.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-small text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-small font-medium text-gray-900 mb-3">Contact</h4>
            <a
              href="mailto:gmwbirvine@gmail.com"
              className="text-small text-gray-500 hover:text-gray-900 transition-colors"
            >
              gmwbirvine@gmail.com
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <p className="text-tiny text-gray-400">
            &copy; {currentYear} Global Mission Wind Band. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
