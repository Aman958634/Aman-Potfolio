import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export const API_URL = 'https://aman-potfolio-production.up.railway.app/api';
export const API_HOST = API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isRenderableImageSource = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return false;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) return false;
  return /^(https?:\/\/|data:|\/|uploads\/|\.\/|\.\.\/)/i.test(trimmed);
};

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return imagePath;
  if (typeof imagePath !== 'string') return imagePath;
  const trimmed = imagePath.trim();
  if (!trimmed) return trimmed;
  if (/^(https?:\/\/|data:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return `${API_HOST}${trimmed}`;
  if (trimmed.startsWith('uploads/')) return `${API_HOST}/${trimmed}`;
  return trimmed;
};

const parseApiError = (error) => {
  if (error?.response?.data?.message) {
    return new Error(error.response.data.message);
  }

  if (error?.response?.data) {
    return new Error(JSON.stringify(error.response.data));
  }

  if (error?.message) {
    return new Error(error.message);
  }

  return new Error('Network error');
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    config.headers = config.headers || {};
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('adminEmail', email);
    }
    return response;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('adminEmail');
};

export const isAuthenticated = () => Boolean(localStorage.getItem('token'));

const createCrudService = (endpoint) => ({
  getAll: async () => {
    try {
      return await api.get(`/${endpoint}`);
    } catch (error) {
      throw parseApiError(error);
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/${endpoint}/${id}`);
    } catch (error) {
      throw parseApiError(error);
    }
  },
  getBySlug: async (slug) => {
    try {
      return await api.get(`/${endpoint}/${slug}`);
    } catch (error) {
      throw parseApiError(error);
    }
  },
  create: async (data) => {
    try {
      return await api.post(`/${endpoint}`, data);
    } catch (error) {
      throw parseApiError(error);
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/${endpoint}/${id}`, data);
    } catch (error) {
      throw parseApiError(error);
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/${endpoint}/${id}`);
    } catch (error) {
      throw parseApiError(error);
    }
  },
  remove: async (id) => {
    try {
      return await api.delete(`/${endpoint}/${id}`);
    } catch (error) {
      throw parseApiError(error);
    }
  },
});

export const projectsService = createCrudService('projects');
export const skillsService = createCrudService('skills');
export const experienceService = createCrudService('experience');
export const servicesService = createCrudService('services');
export const sectionsService = createCrudService('sections');
export const settingsService = createCrudService('settings');
export const contactService = createCrudService('contact');
export const testimonialsService = createCrudService('testimonials');
export const usersService = createCrudService('users');
export const analyticsService = createCrudService('analytics');

export const projectsAPI = projectsService;
export const skillsAPI = skillsService;
export const experienceAPI = experienceService;
export const servicesAPI = servicesService;
export const sectionsAPI = sectionsService;
export const settingsAPI = settingsService;
export const contactAPI = contactService;
export const testimonialsAPI = testimonialsService;
export const usersAPI = usersService;
export const analyticsAPI = analyticsService;

export const uploadAPI = {
  uploadImage: async (formData) => {
    try {
      return await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw parseApiError(error);
    }
  },
};

export const useApiResource = (fetcher, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetcher();
      setData(response.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load resource');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, setData, loading, error, refresh };
};

export default api;

