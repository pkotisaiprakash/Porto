import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Profile = () => {
  const { user, updateUser, isPremium } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [usernameError, setUsernameError] = useState('');
  useDocumentTitle('Edit Profile');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear username error when user starts typing
    if (name === 'username') {
      setUsernameError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile(formData);
      if (response.data.success) {
        updateUser(response.data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile';
      if (errorMsg.includes('Username')) {
        setUsernameError(errorMsg);
      } else {
        setMessage({ type: 'error', text: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="mt-2 text-gray-400">Manage your account settings and subscription</p>
        </div>

        {/* Profile Form */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Account Information</h2>
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-900/30 border border-green-700 text-green-400' 
                : 'bg-red-900/30 border border-red-700 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Avatar Display */}
            <div className="flex items-center mb-6">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-cyan-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-semibold border-2 border-cyan-500">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="ml-4">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Name Field */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-100 placeholder-gray-400"
                placeholder="Enter your full name"
              />
            </div>

            {/* Username Field */}
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">/u/</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-100 placeholder-gray-400"
                  placeholder="username"
                />
              </div>
              {usernameError && (
                <p className="mt-2 text-sm text-red-400">{usernameError}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">Your portfolio URL: /u/{formData.username || 'username'}</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Subscription Status */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Subscription</h2>
          
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium text-lg">
                  {isPremium ? 'Premium Member' : 'Free Plan'}
                </p>
                <p className="text-sm text-gray-400">
                  {isPremium 
                    ? `Premium expires: ${formatDate(user?.premiumExpiryDate)}`
                    : 'Upgrade to unlock premium features'
                  }
                </p>
              </div>
            </div>
            <Link
              to="/premium"
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isPremium 
                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white'
              }`}
            >
              {isPremium ? 'Manage' : 'Upgrade'}
            </Link>
          </div>

          {/* Premium Features List */}
          {!isPremium && (
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-3">Premium benefits include:</p>
              <ul className="space-y-2">
                {[
                  'All premium templates',
                  'Custom domain support',
                  'Analytics dashboard',
                  'Priority support',
                  'No watermarks'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Email</span>
              <span className="text-gray-200">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Member Since</span>
              <span className="text-gray-200">
                {user?.memberSince ? formatDate(user.memberSince) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Account Type</span>
              <span className="text-gray-200 capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
