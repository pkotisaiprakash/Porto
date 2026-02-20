import { createContext, useContext, useState, useEffect } from 'react';
import { portfolioAPI, templateAPI } from '../services/api';
import { useAuth } from './AuthContext';

const PortfolioContext = createContext(null);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolio();
      fetchTemplates();
    }
  }, [isAuthenticated]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.get();
      setPortfolio(response.data.portfolio);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await templateAPI.getAll();
      setTemplates(response.data.templates);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const createPortfolio = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioAPI.create(data);
      setPortfolio(response.data.portfolio);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create portfolio';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolio = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioAPI.update(data);
      setPortfolio(response.data.portfolio);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update portfolio';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const publishPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioAPI.publish();
      setPortfolio(response.data.portfolio);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to publish portfolio';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const unpublishPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioAPI.unpublish();
      setPortfolio(response.data.portfolio);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to unpublish portfolio';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = async (templateId) => {
    try {
      setLoading(true);
      setError(null);
      
      // If no portfolio exists, create one first
      if (!portfolio) {
        const createRes = await portfolioAPI.create({ templateId });
        setPortfolio(createRes.data.portfolio);
        return { success: true };
      }
      
      // Update existing portfolio with template
      const response = await portfolioAPI.update({ templateId });
      setPortfolio(response.data.portfolio);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to select template';
      setError(message);
      console.error('selectTemplate error:', err);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const getPublicPortfolio = async (username) => {
    try {
      const response = await portfolioAPI.getPublic(username);
      return { success: true, portfolio: response.data.portfolio };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Portfolio not found' };
    }
  };

  const uploadResume = async (file) => {
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioAPI.uploadResume(file);
      setPortfolio(response.data.portfolio);
      return {
        success: true,
        message: response.data.message,
        parsedData: response.data.parsedData || {},
        parsedDataHasInfo: response.data.parsedDataHasInfo || false,
        portfolio: response.data.portfolio
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload resume';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioAPI.deleteResume();
      setPortfolio(response.data.portfolio);
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete resume';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    portfolio,
    templates,
    loading,
    error,
    fetchPortfolio,
    fetchTemplates,
    createPortfolio,
    updatePortfolio,
    publishPortfolio,
    unpublishPortfolio,
    selectTemplate,
    getPublicPortfolio,
    uploadResume,
    deleteResume
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};
