import api from './api';

export const cartService = {
  // Get current cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addItem: async (medicineId, quantity) => {
    const response = await api.post('/cart/add', {
      medicine_id: medicineId,
      quantity: quantity
    });
    return response.data;
  },

  // Update item quantity
  updateItem: async (itemId, quantity) => {
    const response = await api.put(`/cart/items/${itemId}`, {
      quantity: quantity
    });
    return response.data;
  },

  // Remove item from cart
  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  // Get cart total
  getTotal: async () => {
    const response = await api.get('/cart/total');
    return response.data;
  },

  // Validate cart stock
  validateStock: async () => {
    const response = await api.get('/cart/validate-stock');
    return response.data;
  },

  // Get cart summary (lightweight)
  getSummary: async () => {
    const response = await api.get('/cart/summary');
    return response.data;
  }
};

export const orderService = {
  // Create order from cart
  createOrder: async (orderData = {}) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user's orders
  getOrders: async (page = 1, perPage = 10) => {
    const response = await api.get(`/orders?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  // Get single order details
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data;
  }
};