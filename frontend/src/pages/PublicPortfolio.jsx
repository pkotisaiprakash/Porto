import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TemplateRenderer from '../components/TemplateRenderer';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { portfolioAPI } from '../services/api';


const PublicPortfolio = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // dynamic page title based on loaded portfolio
  useDocumentTitle(portfolio?.name ? `${portfolio.name}'s Portfolio` : `Portfolio (${username})`);

  useEffect(() => {
    fetchPortfolio();
  }, [username]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getPublic(username);
      if (response.data.success) {
        setPortfolio(response.data.portfolio);
      } else {
        setError(response.data.message || 'Portfolio not found');
      }
    } catch (err) {
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Portfolio Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">This portfolio doesn't exist or hasn't been published yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Credits Link */}
      <a
        href="/"
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Porto
      </a>
      
      <TemplateRenderer portfolio={portfolio} template={portfolio.templateId} />
    </div>
  );
};

export default PublicPortfolio;
