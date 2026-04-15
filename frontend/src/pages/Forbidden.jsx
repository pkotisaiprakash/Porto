import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-red-500">403</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-4">
          Access Forbidden
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
          You don't have permission to access this page.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;