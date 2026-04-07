import { useState, useEffect, useCallback, useMemo } from 'react';
import { pharmaConnectApi } from '../lib/api';

// Generic API hook for any endpoint
export function useApi(endpoint, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await endpoint(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  return { data, loading, error, execute };
}

// Hook for fetching data on mount
export function useFetch(endpoint, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await endpoint();
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error, refetch: () => fetchData() };
}

// Hook for cart operations
export function useCart() {
  const { data: cart, loading, error, execute: refetchCart } = useFetch(pharmaConnectApi.cart.show, { items: [], total_price: 0 });
  const [actionLoading, setActionLoading] = useState(false);

  const addToCart = useCallback(async (medicamentId, quantity = 1) => {
    setActionLoading(true);
    try {
      await pharmaConnectApi.cart.add(medicamentId, quantity);
      await refetchCart();
    } finally {
      setActionLoading(false);
    }
  }, [refetchCart]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    setActionLoading(true);
    try {
      await pharmaConnectApi.cart.update(itemId, quantity);
      await refetchCart();
    } finally {
      setActionLoading(false);
    }
  }, [refetchCart]);

  const removeItem = useCallback(async (itemId) => {
    setActionLoading(true);
    try {
      await pharmaConnectApi.cart.remove(itemId);
      await refetchCart();
    } finally {
      setActionLoading(false);
    }
  }, [refetchCart]);

  const clearCart = useCallback(async () => {
    setActionLoading(true);
    try {
      await pharmaConnectApi.cart.clear();
      await refetchCart();
    } finally {
      setActionLoading(false);
    }
  }, [refetchCart]);

  return {
    cart,
    loading,
    error,
    actionLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refetchCart,
  };
}

// Hook for orders
export function useOrders() {
  const { data: orders, loading, error, execute: refetchOrders } = useFetch(pharmaConnectApi.orders.list, []);
  const [actionLoading, setActionLoading] = useState(false);

  const createOrder = useCallback(async (orderData = {}) => {
    setActionLoading(true);
    try {
      const result = await pharmaConnectApi.orders.create(orderData);
      await refetchOrders();
      return result;
    } finally {
      setActionLoading(false);
    }
  }, [refetchOrders]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    setActionLoading(true);
    try {
      await pharmaConnectApi.orders.updateStatus(orderId, status);
      await refetchOrders();
    } finally {
      setActionLoading(false);
    }
  }, [refetchOrders]);

  return {
    orders,
    loading,
    error,
    actionLoading,
    createOrder,
    updateOrderStatus,
    refetchOrders,
  };
}

// Hook for medicaments
export function useMedicaments() {
  const { data: medicaments, loading, error, execute: refetchMedicaments } = useFetch(pharmaConnectApi.medicaments.list, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [pharmacyFilter, setPharmacyFilter] = useState('');

  const filteredMedicaments = useMemo(() => {
    return medicaments.filter((item) => {
      const name = String(item.name || item.title || '').toLowerCase();
      const pharmacy = String(item.pharmacy?.name || '').toLowerCase();
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query || name.includes(query) || pharmacy.includes(query);
      const matchesPharmacy = !pharmacyFilter || item.pharmacy?.name === pharmacyFilter;
      return matchesSearch && matchesPharmacy;
    });
  }, [medicaments, searchTerm, pharmacyFilter]);

  const pharmacyOptions = useMemo(() => {
    const pharmacies = medicaments
      .map((item) => item.pharmacy?.name)
      .filter(Boolean);
    return [...new Set(pharmacies)];
  }, [medicaments]);

  return {
    medicaments: filteredMedicaments,
    allMedicaments: medicaments,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    pharmacyFilter,
    setPharmacyFilter,
    pharmacyOptions,
    refetchMedicaments,
  };
}

// Hook for pharmacies
export function usePharmacies() {
  const { data: pharmacies, loading, error, execute: refetchPharmacies } = useFetch(pharmaConnectApi.pharmacies.list, []);

  return {
    pharmacies,
    loading,
    error,
    refetchPharmacies,
  };
}

// Hook for pharmacien dashboard
export function usePharmacienDashboard() {
  const [dashboard, setDashboard] = useState({
    pharmacy: null,
    medicaments: [],
    orders: [],
    stats: {
      totalMedicaments: 0,
      lowStockCount: 0,
      totalOrders: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [pharmacyRes, medicamentsRes, ordersRes] = await Promise.all([
        pharmaConnectApi.pharmacien.pharmacy.show(),
        pharmaConnectApi.pharmacien.medicaments.list(),
        pharmaConnectApi.pharmacien.orders.list(),
      ]);

      const pharmacy = pharmacyRes.data;
      const medicaments = medicamentsRes.data || [];
      const orders = ordersRes.data || [];
      const lowStockCount = medicaments.filter(item => Number(item.stock ?? 0) <= 20).length;

      setDashboard({
        pharmacy,
        medicaments,
        orders,
        stats: {
          totalMedicaments: medicaments.length,
          lowStockCount,
          totalOrders: orders.length,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
