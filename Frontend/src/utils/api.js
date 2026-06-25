import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_HOST = new URL(API_URL).origin;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return imagePath;
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
  if (imagePath.startsWith('/')) return `${API_HOST}${imagePath}`;
  return `${API_HOST}/${imagePath}`;
};

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers = {
    ...config.headers,
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };

  if ((config.method || 'get').toLowerCase() === 'get') {
    config.params = {
      ...(config.params || {}),
      _ts: Date.now(),
    };
  }

  return config;
});

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const skillsAPI = {
  getAll: () => api.get('/skills'),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
};

export const experienceAPI = {
  getAll: () => api.get('/experience'),
  create: (data) => api.post('/experience', data),
  update: (id, data) => api.put(`/experience/${id}`, data),
  delete: (id) => api.delete(`/experience/${id}`),
};

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  delete: (id) => api.delete(`/contact/${id}`),
};

export const sectionsAPI = {
  getAll: () => api.get('/sections'),
  getBySlug: (slug) => api.get(`/sections/${slug}`),
  create: (data) => api.post('/sections', data),
  update: (slug, data) => api.put(`/sections/${slug}`, data),
  delete: (slug) => api.delete(`/sections/${slug}`),
};

export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const testimonialsAPI = {
  getAll: () => api.get('/testimonials'),
  getById: (id) => api.get(`/testimonials/${id}`),
  create: (data) => api.post('/testimonials', data),
  update: (id, data) => api.put(`/testimonials/${id}`, data),
  delete: (id) => api.delete(`/testimonials/${id}`),
};

export const settingsAPI = {
  getAll: () => api.get('/settings'),
  getByKey: (key) => api.get(`/settings/${key}`),
  create: (data) => api.post('/settings', data),
  update: (key, data) => api.put(`/settings/${key}`, data),
  delete: (key) => api.delete(`/settings/${key}`),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const analyticsAPI = {
  getAll: () => api.get('/analytics'),
  getById: (id) => api.get(`/analytics/${id}`),
  create: (data) => api.post('/analytics', data),
  update: (id, data) => api.put(`/analytics/${id}`, data),
  delete: (id) => api.delete(`/analytics/${id}`),
};

export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
