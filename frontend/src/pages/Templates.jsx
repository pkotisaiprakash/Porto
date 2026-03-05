import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { templateAPI, authAPI } from '../services/api';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import TemplateRenderer from '../components/TemplateRenderer';
import useDocumentTitle from '../hooks/useDocumentTitle';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingTemplate, setPayingTemplate] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'free', 'premium'
  const { portfolio, selectTemplate } = usePortfolio();
  const { setDisableThemeChange, forceLightMode } = useTheme();
  const { user, isPremium, updatePremium, isAuthenticated } = useAuth();
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
    // Disable theme changes in preview mode and force light mode
    setDisableThemeChange(true);
    forceLightMode(true);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
    // Re-enable theme changes
    setDisableThemeChange(false);
    forceLightMode(false);
  };

  // Export portfolio preview as PDF
  const exportPreviewPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('portfolio-preview');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const availableWidth = pdfWidth - margin * 2;
      const availableHeight = pdfHeight - margin * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;

      const imgX = margin + (availableWidth - finalWidth) / 2;
      const imgY = margin;

      pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);
      pdf.save('portfolio.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
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

  const handlePremiumClick = (template) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setPayingTemplate(template);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    try {
      // Simulate payment processing - in production, this would integrate with a payment gateway
      const paymentId = 'PAY_' + Date.now();
      const response = await authAPI.purchasePremium(paymentId);
      
      if (response.data.success) {
        updatePremium(response.data.user);
        setShowPaymentModal(false);
        setPayingTemplate(null);
        // Now allow selecting the premium template
        if (payingTemplate) {
          await handleSelectTemplate(payingTemplate._id);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
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

          {/* Filter Tabs */}
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({templates.length})
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                filter === 'free'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Free ({templates.filter(t => !t.isPremium).length})
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                filter === 'premium'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Premium ({templates.filter(t => t.isPremium).length})
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {templates.filter(t => filter === 'all' || (filter === 'free' && !t.isPremium) || (filter === 'premium' && t.isPremium)).map((template) => (
            <div
              key={template._id}
              className={`bg-white dark:bg-gray-800 dark:text-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-lg relative ${
                template.isPremium ? 'premium-template-card' : ''
              } ${
                portfolio?.templateId?._id === template._id ? 'ring-2 ring-primary-500' : ''
              }`}
              style={template.isPremium ? {
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%)'
              } : {}}
            >
              {/* Premium animated border */}
              {template.isPremium && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none premium-border-glow"></div>
              )}
              
              {/* Preview Image */}
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {template.isPremium && (
                  <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-amber-400 to-transparent opacity-50"></div>
                    <div className="absolute top-0 right-0 h-px w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50"></div>
                  </div>
                )}
                <img
                  src={template.previewImage}
                  alt={template.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${template.isPremium ? 'hover:scale-105' : ''}`}
                />
                {portfolio?.templateId?._id === template._id && (
                  <div className="absolute top-3 right-3 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Selected
                  </div>
                )}
                {template.isPremium && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg animate-pulse">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium
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
                  {template.isPremium && !isPremium ? (
                    <button
                      onClick={() => handlePremiumClick(template)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      Rs 9
                    </button>
                  ) : portfolio?.templateId?._id === template._id ? (
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
            <div className="relative bg-blue-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-lg font-semibold">{previewTemplate.name} Template Preview</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportPreviewPDF}
                    disabled={isExporting}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <span className="animate-spin">⏳</span> Exporting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export PDF
                      </>
                    )}
                  </button>
                  <button onClick={closePreview} className="p-2 hover:bg-gray-800 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <div id="portfolio-preview">
                  <TemplateRenderer template={previewTemplate} isPreview={true} />
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50">
                {previewTemplate.isPremium && !isPremium ? (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-yellow-800">Premium Template</span>
                      </div>
                      <p className="text-sm text-yellow-700">This is a premium template. Pay Rs 9 to unlock.</p>
                    </div>
                    <button
                      onClick={() => { closePreview(); handlePremiumClick(previewTemplate); }}
                      className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      Pay Rs 9 to Unlock
                    </button>
                  </div>
                ) : portfolio ? (
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowPaymentModal(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-5">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Unlock Premium</h3>
                  <p className="text-gray-500 mt-2">Get access to all premium templates</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Premium Access</span>
                    <span className="text-2xl font-bold text-gray-900">Rs 9</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="text-gray-900 font-medium">30 Days</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={processPayment}
                    disabled={isProcessingPayment}
                    className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="animate-spin">⏳</span> Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                        Pay Rs 9
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  This is a demo payment. No actual money will be charged.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
