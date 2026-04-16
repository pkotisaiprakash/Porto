import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  if (import.meta.env.DEV) {
    API_URL = 'http://localhost:5000/api';
  } else {
    API_URL = '/api';
  }
} else if (!API_URL.endsWith('/api')) {
  API_URL = API_URL.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const fileApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      window.location.href = '/403';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', email),
  resetPassword: (resetToken, password) => api.post(`/auth/reset-password/${resetToken}`, { password }),
  purchasePremium: (paymentId, plan = 'monthly') => api.post('/auth/purchase-premium', { paymentId, plan, amount: plan === 'yearly' ? 99 : 9 }),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  updateAvatar: (avatarUrl) => api.put('/auth/update-profile', { avatar: avatarUrl }),
  sendOTP: (email) => api.post('/auth/send-otp', email),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  getAllUsers: () => api.get('/auth/users'),
  updateUser: (userId, data) => api.put(`/auth/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`),
  sendBulkMail: (data) => api.post('/auth/send-bulk-mail', data),
  getMailHistory: (params) => api.get('/auth/mail-history', { params }),
  getMailTemplates: () => api.get('/auth/mail-templates'),
  handleGoogleCallback: (token) => {
    localStorage.setItem('token', token);
    return Promise.resolve({ data: { success: true } });
  },
  googleAuth: () => {
    window.location.href = `${API_URL}/auth/google`;
  }
};

export const templateAPI = {
  getAll: () => api.get('/templates'),
  getAdmin: () => api.get('/templates/admin/all'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  toggle: (id) => api.put(`/templates/${id}/toggle`),
  reseed: () => api.post('/admin/reseed-templates')
};

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
  deleteResume: () => api.delete('/portfolio/resume'),
  saveDraft: (draftData) => api.post('/portfolio/draft', { draftData }),
  getDraft: () => api.get('/portfolio/draft')
};

export default api;