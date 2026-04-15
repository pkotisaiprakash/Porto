import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import axios from 'axios';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const otpInputsRef = useRef([]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useDocumentTitle('Register');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOTP = formData.otp.split('');
    newOTP[index] = value.slice(-1);
    const otpString = newOTP.join('');
    setFormData({ ...formData, otp: otpString });

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/auth/register/send-otp`, { email: formData.email });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (step === 1) {
      setLoading(true);
      try {
        await axios.post(`${apiUrl}/auth/register/send-otp`, { email: formData.email });
        setStep(2);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to send OTP');
      }
      setLoading(false);
    } else {
      if (formData.otp.length !== 6) {
        setError('Please enter the complete 6-digit OTP');
        return;
      }
      setLoading(true);
      try {
        const username = formData.name.replace(/\s+/g, '').toLowerCase();
        const response = await axios.post(`${apiUrl}/auth/register/verify`, {
          email: formData.email,
          otp: formData.otp,
          name: formData.name,
          username: username,
          password: formData.password
        });

        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          navigate('/dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired OTP');
      }
      setLoading(false);
    }
  };

  const OTPBox = ({ index }) => (
    <input
      ref={(el) => (otpInputsRef.current[index] = el)}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={formData.otp[index] || ''}
      onChange={(e) => handleOTPChange(index, e.target.value)}
      onKeyDown={(e) => handleOTPKeyDown(index, e)}
      className="w-12 h-12 lg:w-14 lg:h-14 text-center text-lg lg:text-xl font-bold border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
    />
  );

return (
    <div className="lg:mt-8 lg:pb-8 bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row items-center justify-center py-2 lg:py-4 px-4 text-gray-900 dark:text-gray-100 overflow-hidden">
      {step === 1 && (
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-4 lg:p-8">
          <Link to="/" className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent mb-2 lg:mb-4">Porto</Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2 lg:mb-4">Join Porto!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm lg:text-lg max-w-md mb-3 lg:mb-6">
            Create your account and start building your professional portfolio today.
          </p>
          <div className="relative mt-2 lg:mt-4">
            <div className="flex justify-center items-end h-12 lg:h-16 lg:h-20">
              <div className={`transition-all duration-500 ease-in-out transform ${(showPassword || showConfirmPassword) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
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
              <div className={`mx-2 transition-all duration-500 ease-in-out transform ${(showPassword || showConfirmPassword) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
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
              <div className={`transition-all duration-500 ease-in-out transform ${(showPassword || showConfirmPassword) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
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
            <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${(showPassword || showConfirmPassword) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
              <div className="bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">
                Password exposed!
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`w-full ${step === 1 ? 'lg:w-1/2' : 'lg:w-full'} max-w-md`}>
        {step === 1 && (
          <div className="text-center mb-3 mt-0 lg:hidden">
            <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">Porto</Link>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Start building your portfolio today</p>
          </div>
        )}

        {step === 2 && (
          <div className="text-center mb-3 mt-0 lg:hidden">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify your email</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Enter the code sent to your email</p>
          </div>
        )}

        <div className="relative mb-2 lg:hidden">
          <div className="flex justify-center items-end h-14">
            <div className={`transition-all duration-500 ease-in-out transform ${(showPassword || showConfirmPassword) ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
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
            <div className={`mx-1 transition-all duration-500 ease-in-out transform ${(showPassword || showConfirmPassword) ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
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
            <div className={`transition-all duration-500 ease-in-out transform ${(showPassword || showConfirmPassword) ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
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
          <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${(showPassword || showConfirmPassword) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
            <div className="bg-yellow-400 text-gray-900 text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              Password exposed!
            </div>
          </div>
        </div>

        <div className="bg-white m-4 dark:bg-gray-800 rounded-2xl shadow-xl p-3 lg:p-4 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-3">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                <div>
                  <label htmlFor="name" className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5 lg:mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5 lg:mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5 lg:mb-1">
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
                      className="w-full px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Create a password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-2 focus:outline-none" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.529 3.529m7.205 7.205a2 2 0 002.828 2.829" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-5.858-4.31a3 3 0 00-4.242-4.242m-3.665 3.665a10.047 10.047 0 01-1.563-3.029M5.636 5.636a2 2 0 00-.002 2.828m7.205.002a2 2 0 002.828-.002" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5 lg:mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 lg:px-4 lg:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-2 focus:outline-none" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showConfirmPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.529 3.529m7.205 7.205a2 2 0 002.828 2.829" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-5.858-4.31a3 3 0 00-4.242-4.242m-3.665 3.665a10.047 10.047 0 01-1.563-3.029M5.636 5.636a2 2 0 00-.002 2.828m7.205.002a2 2 0 002.828-.002" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm mb-4 w-full text-center">
                  OTP sent to {formData.email}
                </div>

                <div className="flex gap-2 justify-center mb-4">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <OTPBox key={index} index={index} />
                  ))}
                </div>

                <button type="button" onClick={handleResendOTP} disabled={loading} className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500">
                  Resend OTP
                </button>
              </div>
            )}

            <br />
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium py-1.5 px-4 lg:py-2 lg:px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (step === 1 ? 'Send Verification Code' : 'Verifying...') : (step === 1 ? 'Send Verification Code' : 'Create account')}
            </button>
          </form>

          {step === 1 && (
            <>
              <div className="mt-3 flex items-center">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                <span className="px-2 text-xs text-gray-500 dark:text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              <div className="mt-3">
                <button type="button" onClick={() => { const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; window.location.href = `${apiUrl}/auth/google`; }} className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
              </div>
            </>
          )}

          <div className="mt-4 text-center mb-2">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;