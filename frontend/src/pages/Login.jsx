import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  useDocumentTitle('Login');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className=" bg-gray-900 flex flex-col lg:flex-row items-center justify-center py-4 lg:py-8 px-4 text-gray-100 overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-8">
        <Link to="/" className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent mb-4">Porto</Link>
        <h1 className="text-3xl font-bold text-white text-center mb-4">Welcome Back!</h1>
        <p className="text-gray-400 text-center text-lg max-w-md mb-6">
          Sign in to access your portfolio and continue building your professional presence.
        </p>
        {/* Animated Peeking Characters - Left Side */}
        <div className="relative mt-4">
          <div className="flex justify-center items-end h-16 lg:h-20">
            {/* Character 1 - Left */}
            <div 
              className={`transition-all duration-500 ease-in-out transform ${showPassword ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <svg className="w-10 h-10 lg:w-14 lg:h-14" viewBox="0 0 40 40">
                <circle cx="20" cy="15" r="12" className="fill-purple-400" />
                <ellipse cx="15" cy="13" rx="3" ry="4" className="fill-white" />
                <ellipse cx="25" cy="13" rx="3" ry="4" className="fill-white" />
                <circle cx="16" cy="14" r="2" className="fill-gray-800" />
                <circle cx="26" cy="14" r="2" className="fill-gray-800" />
                <ellipse cx="20" cy="22" rx="3" ry="2" className="fill-pink-300" />
                <path d="M8 12 Q20 2 32 12" className="fill-purple-600" />
              </svg>
            </div>

            {/* Character 2 - Center */}
            <div 
              className={`mx-2 transition-all duration-500 ease-in-out transform ${showPassword ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              style={{ transitionDelay: '100ms' }}
            >
              <svg className="w-12 h-12 lg:w-16 lg:h-16" viewBox="0 0 40 40">
                <circle cx="20" cy="16" r="14" className="fill-cyan-400" />
                <ellipse cx="13" cy="14" rx="4" ry="5" className="fill-white" />
                <ellipse cx="27" cy="14" rx="4" ry="5" className="fill-white" />
                <circle cx="14" cy="15" r="2.5" className="fill-gray-800 animate-pulse" />
                <circle cx="28" cy="15" r="2.5" className="fill-gray-800 animate-pulse" />
                <circle cx="20" cy="24" r="3" className="fill-pink-300" />
                <circle cx="13" cy="14" r="6" fill="none" stroke="#374151" strokeWidth="1.5" />
                <circle cx="27" cy="14" r="6" fill="none" stroke="#374151" strokeWidth="1.5" />
                <line x1="19" y1="14" x2="21" y2="14" stroke="#374151" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Character 3 - Right */}
            <div 
              className={`transition-all duration-500 ease-in-out transform ${showPassword ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <svg className="w-10 h-10 lg:w-14 lg:h-14" viewBox="0 0 40 40">
                <circle cx="20" cy="15" r="12" className="fill-green-400" />
                <ellipse cx="15" cy="13" rx="3" ry="4" className="fill-white" />
                <ellipse cx="25" cy="13" rx="3" ry="4" className="fill-white" />
                <circle cx="14" cy="14" r="2" className="fill-gray-800" />
                <circle cx="24" cy="14" r="2" className="fill-gray-800" />
                <ellipse cx="20" cy="22" rx="4" ry="3" className="fill-pink-300" />
                <path d="M16 21 Q20 24 24 21" fill="none" stroke="#be185d" strokeWidth="1" />
              </svg>
            </div>
          </div>
          {/* Speech bubble */}
          <div 
            className={`absolute -top-2 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${showPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
          >
            <div className="bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">
              😲 Password exposed!
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 max-w-md">
        {/* Mobile-only branding */}
        <div className="text-center mb-8 lg:hidden">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">Porto</Link>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        {/* PC-only title */}
        <div className="lg:text-center mb-8 hidden">
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        {/* Mobile: Peeking Characters Animation */}
        <div className="relative mb-4 lg:hidden">
          <div className="flex justify-center items-end h-14">
            {/* Character 1 - Left */}
            <div 
              className={`transition-all duration-500 ease-in-out transform ${showPassword ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
            >
              <svg className="w-8 h-8" viewBox="0 0 40 40">
                <circle cx="20" cy="15" r="12" className="fill-purple-400" />
                <ellipse cx="15" cy="13" rx="3" ry="4" className="fill-white" />
                <ellipse cx="25" cy="13" rx="3" ry="4" className="fill-white" />
                <circle cx="16" cy="14" r="2" className="fill-gray-800" />
                <circle cx="26" cy="14" r="2" className="fill-gray-800" />
                <ellipse cx="20" cy="22" rx="3" ry="2" className="fill-pink-300" />
                <path d="M8 12 Q20 2 32 12" className="fill-purple-600" />
              </svg>
            </div>

            {/* Character 2 - Center */}
            <div 
              className={`mx-1 transition-all duration-500 ease-in-out transform ${showPassword ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
              style={{ transitionDelay: '100ms' }}
            >
              <svg className="w-10 h-10" viewBox="0 0 40 40">
                <circle cx="20" cy="16" r="14" className="fill-cyan-400" />
                <ellipse cx="13" cy="14" rx="4" ry="5" className="fill-white" />
                <ellipse cx="27" cy="14" rx="4" ry="5" className="fill-white" />
                <circle cx="14" cy="15" r="2.5" className="fill-gray-800 animate-pulse" />
                <circle cx="28" cy="15" r="2.5" className="fill-gray-800 animate-pulse" />
                <circle cx="20" cy="24" r="3" className="fill-pink-300" />
                <circle cx="13" cy="14" r="6" fill="none" stroke="#374151" strokeWidth="1.5" />
                <circle cx="27" cy="14" r="6" fill="none" stroke="#374151" strokeWidth="1.5" />
                <line x1="19" y1="14" x2="21" y2="14" stroke="#374151" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Character 3 - Right */}
            <div 
              className={`transition-all duration-500 ease-in-out transform ${showPassword ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <svg className="w-8 h-8" viewBox="0 0 40 40">
                <circle cx="20" cy="15" r="12" className="fill-green-400" />
                <ellipse cx="15" cy="13" rx="3" ry="4" className="fill-white" />
                <ellipse cx="25" cy="13" rx="3" ry="4" className="fill-white" />
                <circle cx="14" cy="14" r="2" className="fill-gray-800" />
                <circle cx="24" cy="14" r="2" className="fill-gray-800" />
                <ellipse cx="20" cy="22" rx="4" ry="3" className="fill-pink-300" />
                <path d="M16 21 Q20 24 24 21" fill="none" stroke="#be185d" strokeWidth="1" />
              </svg>
            </div>
          </div>
          {/* Speech bubble */}
          <div 
            className={`absolute -top-1 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${showPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
          >
            <div className="bg-yellow-400 text-gray-900 text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              😲 Password exposed!
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 focus:outline-none group"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <div className="relative w-6 h-6">
                    {/* Eye white */}
                    <svg 
                      className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${showPassword ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} 
                      viewBox="0 0 24 24" 
                      fill="none"
                    >
                      <path 
                        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" 
                        className="fill-gray-500 dark:fill-gray-400 group-hover:fill-cyan-500 transition-colors"
                      />
                      <circle cx="12" cy="12" r="3" className="fill-gray-500 dark:fill-gray-400 group-hover:fill-cyan-500 transition-colors" />
                    </svg>
                    
                    {/* Watching eye - opens when password is revealed */}
                    <svg 
                      className={`absolute inset-0 w-6 h-6 transition-all duration-500 ${showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-180'}`} 
                      viewBox="0 0 24 24"
                    >
                      {/* Eye outline */}
                      <ellipse 
                        cx="12" 
                        cy="12" 
                        rx="10" 
                        ry="6" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        className="text-cyan-500"
                      />
                      {/* Animated pupil with shine */}
                      <g className="animate-pulse">
                        <circle cx="12" cy="12" r="4" className="fill-cyan-500" />
                        <circle cx="13.5" cy="10.5" r="1.5" className="fill-white animate-ping" />
                      </g>
                      {/* Eyelids that open */}
                      <path 
                        d="M2 12h20" 
                        stroke="currentColor" 
                        strokeWidth="3"
                        className="text-purple-500 origin-center"
                        style={{ 
                          transformOrigin: '12px 12px',
                          transform: showPassword ? 'scaleX(0)' : 'scaleX(1)',
                          transition: 'transform 0.4s ease-in-out'
                        }}
                      />
                      {/* Decorative sparkles when watching */}
                      {showPassword && (
                        <>
                          <path d="M2 2l2 2M22 2l-2 2M2 22l2-2M22 22l-2-2" stroke="currentColor" strokeWidth="1.5" className="text-yellow-400 animate-pulse">
                            <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
                          </path>
                        </>
                      )}
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-3 text-sm text-gray-500 dark:text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Google Login Button - Coming Soon */}
          <div className="mt-6">
            <div className="relative">
              <div
                className="w-full flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed opacity-70"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                Continue with Google
              </div>
            </div>
            <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
              This will be added soon
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
