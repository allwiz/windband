import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Music, LogIn, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Performances', href: '/performances' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Join Us', href: '/join' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
            {user ? (
              <>
                <Link
                  to={isAdmin() ? "/admin" : "/dashboard"}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  {isAdmin() ? (
                    <>
                      <Shield className="h-4 w-4 text-accent-600" />
                      <span className="text-sm">Admin</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span className="text-sm">{user.full_name ? user.full_name.split(' ')[0] : 'Dashboard'}</span>
                    </>
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-700 transition-colors whitespace-nowrap"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-full hover:from-accent-700 hover:to-accent-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
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

              {/* Mobile Auth Options */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      to={isAdmin() ? "/admin" : "/dashboard"}
                      className="flex items-center space-x-2 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {isAdmin() ? (
                        <>
                          <Shield className="h-5 w-5 text-accent-600" />
                          <span>Admin Panel</span>
                        </>
                      ) : (
                        <>
                          <User className="h-5 w-5" />
                          <span>{user.full_name || 'Dashboard'}</span>
                        </>
                      )}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl hover:from-accent-700 hover:to-accent-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-accent-600 text-accent-600 rounded-xl hover:bg-accent-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Sign Up</span>
                    </Link>
                  </div>
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