import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Call the API to get user data
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
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;