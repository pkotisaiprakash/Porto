import axios from 'axios';

// Dynamic API URL - uses current host for mobile compatibility
const getApiUrl = () => {
  const { protocol, hostname } = window.location;
  // Use the current host's IP/hostname with port 5000
  return `${protocol}//${hostname}:5000/api`;
};

const API_URL = getApiUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create file upload axios instance (for resume uploads)
const fileApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add token to file upload requests
fileApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// Template API
export const templateAPI = {
  getAll: () => api.get('/templates'),
  getAdmin: () => api.get('/templates/admin/all'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  toggle: (id) => api.put(`/templates/${id}/toggle`)
};

// Portfolio API
export const portfolioAPI = {
  get: () => api.get('/portfolio'),
  create: (data) => api.post('/portfolio', data),
  update: (data) => api.put('/portfolio', data),
  delete: () => api.delete('/portfolio'),
  publish: () => api.put('/portfolio/publish'),
  unpublish: () => api.put('/portfolio/unpublish'),
  getPublic: (username) => api.get(`/portfolio/${username}`),
  getAdminStats: () => api.get('/portfolio/admin/stats'),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return fileApi.post('/portfolio/resume', formData);
  },
  deleteResume: () => api.delete('/portfolio/resume')
};

export default api;
