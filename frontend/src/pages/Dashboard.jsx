import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { portfolioAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { portfolio, loading, fetchPortfolio } = usePortfolio();
  const [deleting, setDeleting] = useState(false);
  useDocumentTitle('Dashboard');

  const handleDeletePortfolio = async () => {
    if (!window.confirm('Are you sure you want to delete your portfolio? This action cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    try {
      const response = await portfolioAPI.delete();
      if (response.data.success) {
        await fetchPortfolio();
        alert('Portfolio deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting portfolio:', err);
      alert('Failed to delete portfolio');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your portfolio and share your work with the world.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio Status</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {portfolio ? (portfolio.isPublished ? 'Published' : 'Draft') : 'Not Created'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${portfolio?.isPublished ? 'bg-green-100' : portfolio ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                {portfolio?.isPublished ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : portfolio ? (
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Template Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Template</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {portfolio?.templateId?.name || 'Not Selected'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary-100">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Public URL */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Public URL</p>
                <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                  {portfolio?.isPublished ? (
                    <a 
                      href={`/u/${user?.username}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      /u/{user?.username}
                    </a>
                  ) : (
                    'Not published'
                  )}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/templates"
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
            >
              <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Choose Template</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pick a design</span>
            </Link>

            <Link
              to="/editor"
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
            >
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/30 mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Edit Portfolio</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your details</span>
            </Link>

            <Link
              to="/templates"
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
            >
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Preview</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">See how it looks</span>
            </Link>

            <Link
              to="/resume-builder"
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
            >
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/30 mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Resume Builder</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create professional resumes</span>
            </Link>

            {portfolio?.isPublished ? (
              <a
                href={`/u/${user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors group"
              >
                <div className="p-3 rounded-full bg-purple-100 group-hover:bg-purple-200 mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">View Live</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Open public page</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                <div className="p-3 rounded-full bg-gray-200 mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <span className="font-medium text-gray-400">Publish to share</span>
                <span className="text-sm text-gray-400 mt-1">Complete your portfolio</span>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Preview Card */}
        {portfolio && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your Portfolio</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${portfolio.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {portfolio.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="p-6">
              {portfolio.name ? (
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                    {portfolio.avatar ? (
                      <img src={portfolio.avatar} alt={portfolio.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                        {portfolio.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{portfolio.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{portfolio.title}</p>
                    {portfolio.bio && (
                      <p className="mt-2 text-gray-500 dark:text-gray-400 line-clamp-2">{portfolio.bio}</p>
                    )}
                    <div className="mt-4 flex gap-3">
                      <Link
                        to="/editor"
                        className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Edit
                      </Link>
                      {portfolio.isPublished && (
                        <a
                          href={`/u/${user?.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          View Live
                        </a>
                      )}
                      <button
                        onClick={handleDeletePortfolio}
                        disabled={deleting}
                        className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't added any content yet</p>
                  <Link
                    to="/editor"
                    className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Start Building
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
