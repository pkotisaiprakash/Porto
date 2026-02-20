import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';


const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide navbar on public portfolio pages
  if (location.pathname.startsWith('/u/')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  // Theme toggle icon component
  // we no longer render an icon, the switch will include a circle that slides
  const ThemeIcon = () => null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              {/* <img src={logo} alt="Porto" className="w-8 h-8 mr-2" /> */}
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">Porto</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Dashboard
                </Link>
                <Link to="/templates" className="text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Templates
                </Link>
                <Link to="/resume-builder" className="text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Resume Builder
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 ml-4">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-cyan-500">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    Logout
                  </button>
                  {/* theme toggle moved here */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Toggle theme"
                  >
                    {isDarkMode ? (
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.03a1 1 0 10-1.44 1.44l.7.7a1 1 0 001.44-1.44l-.7-.7zM18 9a1 1 0 100 2h1a1 1 0 100-2h-1zm-2.03 4.22a1 1 0 00-1.44 1.44l.7.7a1 1 0 001.44-1.44l-.7-.7zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-2.03a1 1 0 10-1.44 1.44l.7.7a1 1 0 001.44-1.44l-.7-.7zM2 11a1 1 0 100 2H1a1 1 0 100-2h1zm2.03-4.22a1 1 0 001.44-1.44l-.7-.7a1 1 0 00-1.44 1.44l.7.7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.03a1 1 0 10-1.44 1.44l.7.7a1 1 0 001.44-1.44l-.7-.7zM18 9a1 1 0 100 2h1a1 1 0 100-2h-1zm-2.03 4.22a1 1 0 00-1.44 1.44l.7.7a1 1 0 001.44-1.44l-.7-.7zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-2.03a1 1 0 10-1.44 1.44l.7.7a1 1 0 001.44-1.44l-.7-.7zM2 11a1 1 0 100 2H1a1 1 0 100-2h1zm2.03-4.22a1 1 0 001.44-1.44l-.7-.7a1 1 0 00-1.44 1.44l.7.7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t dark:border-gray-700 py-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Dashboard
                </Link>
                <Link to="/templates" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Templates
                </Link>
                <Link to="/resume-builder" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Resume Builder
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 px-3 pt-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-cyan-500">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{user?.name}</span>
                </div>
                <button onClick={handleLogout} className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
