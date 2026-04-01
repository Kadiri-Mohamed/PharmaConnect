import React, { createContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartOrderService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Load cart when user changes
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [user, loadCart]);

  const loadCart = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getCart();
      setCart(response.data.cart);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addItem = async (medicineId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.addItem(medicineId, quantity);

      // Update cart state
      await loadCart();

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.updateItem(itemId, quantity);

      // Update cart state
      await loadCart();

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      await cartService.removeItem(itemId);

      // Update cart state
      await loadCart();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      await cartService.clearCart();

      // Update cart state
      setCart(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    return cart?.total_price || 0;
  };

  const getItemCount = () => {
    return cart?.item_count || 0;
  };

  const isEmpty = () => {
    return !cart || cart.item_count === 0;
  };

  const value = {
    cart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    loadCart,
    getTotal,
    getItemCount,
    isEmpty,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContext };