import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { orderService } from '../../services/cartOrderService';

const Cart = () => {
  const { cart, loading, error, updateItem, removeItem, clearCart, getTotal, getItemCount, isEmpty, loadCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await updateItem(itemId, newQuantity);
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      try {
        await removeItem(itemId);
      } catch (err) {
        // Error is handled by context
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart();
      } catch (err) {
        // Error is handled by context
      }
    }
  };

  const handleCheckout = async () => {
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setCheckoutError('Delivery address is required for delivery orders');
      return;
    }

    try {
      setCheckoutLoading(true);
      setCheckoutError(null);

      const orderData = {
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : null,
        notes: notes.trim() || null,
      };

      const response = await orderService.createOrder(orderData);

      // Clear cart after successful order
      await loadCart();

      // Reset form
      setDeliveryType('pickup');
      setDeliveryAddress('');
      setNotes('');
      setShowCheckout(false);

      alert(`Order created successfully! Order ID: ${response.data.orders[0].id}`);
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty()) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some medicines to get started!</p>
            <button
              onClick={() => window.location.href = '/medicines'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Medicines
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            disabled={loading}
            className="text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Clear Cart
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cart Items ({getItemCount()})</h2>

            <div className="space-y-4">
              {cart?.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.medicament.name}</h3>
                    <p className="text-sm text-gray-600">{item.medicament.description}</p>
                    <p className="text-sm text-blue-600">{item.medicament.pharmacy.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.medicament.requires_prescription && '💊 Requires prescription'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={loading}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">${item.item_price.toFixed(2)} each</p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Total: ${getTotal().toFixed(2)}</span>
            <button
              onClick={() => setShowCheckout(!showCheckout)}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              {showCheckout ? 'Cancel' : 'Checkout'}
            </button>
          </div>
        </div>

        {/* Checkout Form */}
        {showCheckout && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Checkout</h3>

            {checkoutError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {checkoutError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Type
                </label>
                <div className="space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="mr-2"
                    />
                    Pickup from pharmacy
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="mr-2"
                    />
                    Delivery
                  </label>
                </div>
              </div>

              {deliveryType === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {checkoutLoading ? 'Creating Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
