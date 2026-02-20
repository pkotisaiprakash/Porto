import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { templateAPI } from '../services/api';
import { usePortfolio } from '../context/PortfolioContext';
import TemplateRenderer from '../components/TemplateRenderer';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { portfolio, selectTemplate } = usePortfolio();
  const navigate = useNavigate();

  useDocumentTitle('Templates');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templateAPI.getAll();
      setTemplates(response.data.templates);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (templateId) => {
    const result = await selectTemplate(templateId);
    if (result.success) {
      navigate('/editor');
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  const refreshTemplates = async () => {
    setRefreshing(true);
    try {
      const response = await templateAPI.reseed();
      if (response.data.success) {
        await fetchTemplates();
      }
    } catch (err) {
      console.error('Error refreshing templates:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <button
              onClick={refreshTemplates}
              disabled={refreshing}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <span className="animate-spin">⏳</span> Refreshing...
                </>
              ) : (
                <>
                  <span>🔄</span> Load New Templates
                </>
              )}
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Template</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select from our professionally designed templates to showcase your work
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {templates.map((template) => (
            <div
              key={template._id}
              className={`bg-white dark:bg-gray-800 dark:text-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-lg ${
                portfolio?.templateId?._id === template._id ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {/* Preview Image */}
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                <img
                  src={template.previewImage}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
                {portfolio?.templateId?._id === template._id && (
                  <div className="absolute top-3 right-3 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Selected
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{template.name}</h3>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full capitalize">
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{template.description}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(template)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Preview
                  </button>
                  {portfolio?.templateId?._id === template._id ? (
                    <button
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium"
                      disabled
                    >
                      Selected
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectTemplate(template._id)}
                      className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates available</h3>
            <p className="text-gray-500 dark:text-gray-400">Please check back later for new templates</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70" onClick={closePreview}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{previewTemplate.name} Template Preview</h3>
                <button onClick={closePreview} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <TemplateRenderer template={previewTemplate} isPreview={true} />
              </div>
              <div className="p-4 border-t bg-gray-50">
                {portfolio ? (
                  <button
                    onClick={() => { handleSelectTemplate(previewTemplate._id); closePreview(); }}
                    className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                  >
                    Use This Template
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/register"
                      className="block w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-center"
                    >
                      Sign Up to Use This Template
                    </Link>
                    <p className="text-sm text-gray-500 text-center">
                      Create a free account to start building your portfolio
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
