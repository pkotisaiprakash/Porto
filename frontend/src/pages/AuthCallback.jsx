import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      // Store the token first
      localStorage.setItem('token', token);
      
      // Directly create user from token (skip getMe which might fail due to CORS)
      // Decode JWT to get user info
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        const user = {
          id: decoded.id,
          // We'll get actual user data on first dashboard load
        };
        
        // Store minimal user info - actual data will be fetched on dashboard
        localStorage.setItem('user', JSON.stringify(user));
        setStatus('success');
        
        // Small delay to show success state
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } catch (err) {
        console.error('Token decode error:', err);
        setStatus('error');
        // Try alternative - call getMe
        authAPI.getMe()
          .then((response) => {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
          })
          .catch((err) => {
            console.error('Auth callback error:', err);
            localStorage.removeItem('token');
            navigate('/login?error=auth_failed');
          });
      }
    } else {
      setStatus('error');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p>Completing sign in...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p>Sign in successful! Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✕</div>
            <p>Sign in failed. Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;