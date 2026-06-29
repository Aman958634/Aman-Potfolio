import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_API_URL = 'https://aman-potfolio-production.up.railway.app/api';

const apiUrlAliases = new Map([
  ['https://aman-portfolio-production.up.railway.app/api', DEFAULT_API_URL],
]);

const normalizeApiUrl = (url) => {
  const normalized = String(url || DEFAULT_API_URL).trim().replace(/\/+$/, '');
  return apiUrlAliases.get(normalized) || normalized;
};

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);
export const API_HOST = API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getTokenPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalizedPayload));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = getTokenPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
};

const getStoredToken = () => {
  const token = localStorage.getItem('token');

  if (token && isTokenExpired(token)) {
    logout();
    return null;
  }

  return token;
};

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
  const status = error?.response?.status;
  const response = error?.response;
  let parsedError;

  if (error?.response?.data?.message) {
    parsedError = new Error(error.response.data.message);
  } else if (error?.response?.data) {
    parsedError = new Error(JSON.stringify(error.response.data));
  } else if (error?.message) {
    parsedError = new Error(error.message);
  } else {
    parsedError = new Error('Network error');
  }

  parsedError.status = status;
  parsedError.response = response;
  return parsedError;
};

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    config.headers = config.headers || {};

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

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
    const status = error?.response?.status;
    const isAdminPage = window.location.pathname.startsWith('/admin') || window.location.pathname === '/dashboard';
    const isLoginRequest = error?.config?.url?.includes('/auth/login');

    if ((status === 401 || status === 403) && isAdminPage && !isLoginRequest) {
      logout();
      window.location.assign('/admin/login');
    }

    return Promise.reject(error);
  }
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

export const isAuthenticated = () => Boolean(getStoredToken());

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
projectsService.seedDefault = async () => {
  try {
    return await api.post('/projects/seed');
  } catch (error) {
    throw parseApiError(error);
  }
};
export const skillsService = createCrudService('skills');
export const experienceService = createCrudService('experience');
export const servicesService = createCrudService('services');
export const sectionsService = createCrudService('sections');
export const settingsService = createCrudService('settings');
export const contactService = createCrudService('contact');
contactService.submit = async (data) => {
  try {
    return await api.post('/contact', data);
  } catch (error) {
    throw parseApiError(error);
  }
};
contactService.testEmail = async (data = {}) => {
  try {
    return await api.post('/contact/test-email', data);
  } catch (error) {
    throw parseApiError(error);
  }
};
contactService.resendEmail = async (id) => {
  try {
    return await api.post(`/contact/${id}/resend-email`);
  } catch (error) {
    throw parseApiError(error);
  }
};
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
      return await api.post('/upload', formData);
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

