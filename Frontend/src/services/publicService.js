import api from './api';

// Public API service for non-authenticated endpoints
const publicService = {
  // Pharmacy endpoints
  getPharmacies: async (params = {}) => {
    const response = await api.get('/public/pharmacies', { params });
    return response.data;
  },

  getPharmaciesOnDuty: async (params = {}) => {
    const response = await api.get('/public/pharmacies/on-duty', { params });
    return response.data;
  },

  getPharmacy: async (id) => {
    const response = await api.get(`/public/pharmacies/${id}`);
    return response.data;
  },

  // Medicine endpoints
  getMedicines: async (params = {}) => {
    const response = await api.get('/public/medicines', { params });
    return response.data;
  },

  searchMedicines: async (query, params = {}) => {
    const response = await api.get('/public/medicines/search', {
      params: { query, ...params }
    });
    return response.data;
  },

  checkMedicineAvailability: async (medicineId, quantity = 1) => {
    const response = await api.get(`/public/medicines/${medicineId}/availability`, {
      params: { quantity }
    });
    return response.data;
  },

  getMedicinesByPharmacy: async (pharmacyId, params = {}) => {
    const response = await api.get(`/public/pharmacies/${pharmacyId}/medicines`, { params });
    return response.data;
  },
};

export default publicService;