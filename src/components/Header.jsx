import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Music, LogIn, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Performances', href: '/performances' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Join Us', href: '/join' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nav-blur sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-18 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 lg:space-x-3 hover-lift group flex-shrink-0">
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Music className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display text-base lg:text-lg xl:text-xl font-semibold text-gray-900 tracking-tight group-hover:text-gray-700 transition-colors whitespace-nowrap truncate">
                Global Mission Wind Band
              </span>
              <span className="text-xs text-gray-500 font-medium hidden lg:block whitespace-nowrap">
                Excellence in Musical Performance
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-6 xl:space-x-8 flex-shrink-0">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`font-medium transition-all duration-200 text-sm py-2 whitespace-nowrap ${
                  isActive(item.href)
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Member Login/Dashboard Button - Desktop */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
            {user ? (
              <div className="flex items-center space-x-2 xl:space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors whitespace-nowrap"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden xl:inline">Dashboard</span>
                  <span className="xl:hidden">Dash</span>
                </Link>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-accent-600 hover:text-accent-700 font-medium text-sm transition-colors whitespace-nowrap"
                  >
                    <span>🛡️</span>
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 font-medium text-sm transition-colors whitespace-nowrap"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden xl:inline">Sign Out</span>
                  <span className="xl:hidden">Out</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-accent-600 to-accent-700 text-white px-4 xl:px-6 py-2.5 rounded-full text-sm font-medium hover:from-accent-700 hover:to-accent-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap">
                <LogIn className="h-4 w-4" />
                <span className="hidden xl:inline">Member Login</span>
                <span className="xl:hidden">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-4 pt-2 pb-3 space-y-1 glass-effect border-t border-white/20">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-gray-900 bg-white/60 font-semibold'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/40'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/20">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      className="w-full px-4 py-3 text-sm bg-white/40 text-gray-900 rounded-2xl font-medium flex items-center justify-center space-x-2 transition-all hover:bg-white/60"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        className="w-full px-4 py-3 text-sm bg-accent-100/60 text-accent-700 rounded-2xl font-medium flex items-center justify-center space-x-2 transition-all hover:bg-accent-200/60"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>🛡️</span>
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50/60 rounded-2xl font-medium flex items-center justify-center space-x-2 transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="w-full px-4 py-3 text-sm bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-2xl font-medium flex items-center justify-center space-x-2 hover:from-accent-700 hover:to-accent-800 transition-all shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Member Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;