import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for Laravel Sanctum authentication
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth token logic here if needed
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response) {
      const { status, data } = error.response;

      // Handle authentication errors
      if (status === 401) {
        // Redirect to login or handle unauthorized access
        console.error('Unauthorized access - redirecting to login');
        // window.location.href = '/login';
      }

      // Handle validation errors
      if (status === 422) {
        console.error('Validation errors:', data.errors);
      }

      // Handle server errors
      if (status >= 500) {
        console.error('Server error:', data.message || 'Internal server error');
      }

      // Handle forbidden access
      if (status === 403) {
        console.error('Forbidden access:', data.message || 'Access denied');
      }

      // Handle not found
      if (status === 404) {
        console.error('Resource not found:', data.message || 'Not found');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - please check your connection');
    } else {
      // Other error
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // GET request
  get: (url, config = {}) => {
    return api.get(url, config);
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return api.delete(url, config);
  },

  // PATCH request (commonly used for updates)
  patch: (url, data = {}, config = {}) => {
    return api.patch(url, data, config);
  },
};

// Export the axios instance for direct use if needed
export default api;

// Specific API endpoints for PharmaConnect
export const pharmaConnectApi = {
  // Authentication
  auth: {
    login: (credentials) => apiService.post('/login', credentials),
    register: (userData) => apiService.post('/register', userData),
    logout: () => apiService.post('/logout'),
    user: () => apiService.get('/user'),
  },

  // Pharmacies
  pharmacies: {
    list: () => apiService.get('/pharmacies'),
    show: (id) => apiService.get(`/pharmacies/${id}`),
    medicaments: (id) => apiService.get(`/pharmacies/${id}/medicaments`),
  },

  // Medicaments
  medicaments: {
    list: () => apiService.get('/medicaments'),
    show: (id) => apiService.get(`/medicaments/${id}`),
    search: (query) => apiService.get('/medicaments/search', { params: { q: query } }),
    create: (data) => apiService.post('/medicaments', data),
    update: (id, data) => apiService.put(`/medicaments/${id}`, data),
    delete: (id) => apiService.delete(`/medicaments/${id}`),
  },

  // Cart
  cart: {
    show: () => apiService.get('/cart'),
    add: (medicamentId, quantity = 1) => apiService.post('/cart', { medicament_id: medicamentId, quantity }),
    update: (itemId, quantity) => apiService.put(`/cart/${itemId}`, { quantity }),
    remove: (itemId) => apiService.delete(`/cart/${itemId}`),
    clear: () => apiService.delete('/cart'),
  },

  // Orders
  orders: {
    list: () => apiService.get('/orders'),
    show: (id) => apiService.get(`/orders/${id}`),
    create: (data) => apiService.post('/orders', data),
    updateStatus: (id, status) => apiService.patch(`/orders/${id}/status`, { status }),
  },

  // Pharmacien specific endpoints
  pharmacien: {
    pharmacy: {
      show: () => apiService.get('/pharmacien/pharmacy'),
      update: (data) => apiService.put('/pharmacien/pharmacy', data),
    },
    medicaments: {
      list: () => apiService.get('/pharmacien/medicaments'),
      create: (data) => apiService.post('/pharmacien/medicaments', data),
      update: (id, data) => apiService.put(`/pharmacien/medicaments/${id}`, data),
      delete: (id) => apiService.delete(`/pharmacien/medicaments/${id}`),
    },
    orders: {
      list: () => apiService.get('/pharmacien/orders'),
      updateStatus: (id, status) => apiService.patch(`/pharmacien/orders/${id}/status`, { status }),
    },
    rareRequests: {
      updateStatus: (id, status) => apiService.patch(`/pharmacien/rare-requests/${id}/status`, { status }),
    },
  },

  // Rare requests
  rareRequests: {
    list: () => apiService.get('/rare-requests'),
    create: (data) => apiService.post('/rare-requests', data),
    updateStatus: (id, status) => apiService.patch(`/rare-requests/${id}/status`, { status }),
  },
};
