import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/profile'),
  
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Products API calls
export const productsApi = {
  getAll: (params?: { category?: string; search?: string; page?: number }) =>
    api.get('/products', {
      params: {
        category: params?.category,
        keyword: params?.search,
        pageNumber: params?.page,
      },
    }),

  getById: (id: string) => api.get(`/products/${id}`),

  create: (data: FormData) =>
    api.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => api.delete(`/products/${id}`),
};

// Categories API calls
export const categoriesApi = {
  getAll: () => api.get('/products/categories'),
};

// Cart API calls
export const cartApi = {
  get: () => api.get('/cart'),
  
  addItem: (data: { productId: string; quantity: number }) =>
    api.post('/cart/add', data),
  
  updateItem: (productId: string, quantity: number) =>
    api.put('/cart/update', { productId, quantity }),
  
  removeItem: (productId: string) => api.delete(`/cart/remove/${productId}`),
  
  clear: () => api.delete('/cart/clear'),
};

// Orders API calls
export const ordersApi = {
  getAll: () => api.get('/orders'),
  
  getById: (id: string) => api.get(`/orders/${id}`),
  
  create: (data: any) => api.post('/orders', data),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
};

// Wishlist API calls
export const wishlistApi = {
  get: () => api.get('/wishlist'),
  
  add: (productId: string) => api.post('/wishlist/add', { productId }),
  
  remove: (productId: string) => api.delete(`/wishlist/remove/${productId}`),
};

// Reviews API calls
export const reviewsApi = {
  getByProduct: (productId: string) => api.get(`/reviews/${productId}`),
  
  create: (data: { productId: string; rating: number; comment: string }) =>
    api.post('/reviews', data),
  
  update: (id: string, data: { rating: number; comment: string }) =>
    api.put(`/reviews/${id}`, data),
  
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// Coupons API calls
export const couponsApi = {
  validate: (code: string) => api.post('/coupons/validate', { code }),
  
  getAll: () => api.get('/coupons'),
  
  create: (data: any) => api.post('/coupons', data),
  
  delete: (id: string) => api.delete(`/coupons/${id}`),
};

// Admin API calls
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  
  getUsers: () => api.get('/admin/users'),
  
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

// Email API calls
export const emailApi = {
  sendContactForm: (data: { name: string; email: string; message: string }) =>
    api.post('/email/contact', data),
  
  subscribe: (email: string) => api.post('/email/subscribe', { email }),
};

export default api;