import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';


const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isPremium, logout } = useAuth();
  const { isDarkMode } = useTheme();
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

  return (
    <nav className="bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
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
                <Link to="/dashboard" className="text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Dashboard
                </Link>
                <Link to="/templates" className="text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Templates
                </Link>
                <Link to="/resume-builder" className="text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                  Resume Builder
                </Link>
                {!isPremium && (
                  <Link to="/premium" className="text-amber-400 hover:text-amber-300 px-3 py-2 rounded-md font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 ml-4">
                  {user?.avatar ? (
                    <Link to="/profile">
                      <div className="relative">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500 hover:border-cyan-400 transition-colors" />
                        {isPremium && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full border-2 border-gray-800" title="Premium Member">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <Link to="/profile">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-cyan-500 hover:border-cyan-400 transition-colors">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {isPremium && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full border-2 border-gray-800">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-200 hover:bg-gray-700"
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
          <div className="md:hidden border-t border-gray-700 py-4 mobile-menu-border">
            {isAuthenticated ? (
              <div className="space-y-3">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium transition-colors mobile-nav-border">
                  Dashboard
                </Link>
                <Link to="/templates" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium transition-colors mobile-nav-border">
                  Templates
                </Link>
                <Link to="/resume-builder" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium transition-colors mobile-nav-border">
                  Resume Builder
                </Link>
                {!isPremium && (
                  <Link to="/premium" onClick={() => setMobileMenuOpen(false)} className="block text-amber-400 hover:text-amber-300 px-3 py-2 rounded-md font-medium flex items-center mobile-nav-border">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium mobile-nav-border">
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium mobile-nav-border">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 px-3 pt-2">
                  {user?.avatar ? (
                    <div className="relative">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500" />
                      {isPremium && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full border-2 border-gray-800">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-cyan-500">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      {isPremium && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full border-2 border-gray-800">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <span className="text-gray-200 font-medium">{user?.name}</span>
                    {isPremium && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-gray-200 hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
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

//                     <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-cyan-500">
//                       {user?.name?.charAt(0).toUpperCase()}
//                     </div>
//                   )}
//                   <span className="text-gray-700 dark:text-gray-200 font-medium">{user?.name}</span>
//                 </div>
//                 <button onClick={handleLogout} className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
//                   Logout
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 px-3 py-2 rounded-md font-medium">
//                   Login
//                 </Link>
//                 <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-4 py-2 rounded-md font-medium transition-colors">
//                   Get Started
//                 </Link>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
