import { useEffect, useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total_price: 0, pharmacy_id: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cart', {
        headers: {
          Accept: 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Unable to load cart.');
      }

      const data = await response.json();
      setCart({
        items: data.items || [],
        total_price: Number(data.total_price || 0),
        pharmacy_id: data.pharmacy_id ?? null,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error loading cart.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    setActionLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ quantity }),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Unable to update quantity.');
      }

      await fetchCart();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error updating item.');
    } finally {
      setActionLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Unable to remove item.');
      }

      await fetchCart();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error removing item.');
    } finally {
      setActionLoading(false);
    }
  };

  const clearCart = async () => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Unable to clear cart.');
      }

      setCart({ items: [], total_price: 0, pharmacy_id: null });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error clearing cart.');
    } finally {
      setActionLoading(false);
    }
  };

  const createOrder = async () => {
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ pharmacy_id: cart.pharmacy_id }),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Unable to create order.');
      }

      window.location.href = '/orders';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error creating order.');
      setActionLoading(false);
    }
  };

  const totalPrice = useMemo(() => {
    return cart.items.reduce((sum, item) => {
      const price = Number(item.price ?? item.medicament?.price ?? 0);
      const quantity = Number(item.quantity ?? 0);
      return sum + price * quantity;
    }, 0);
  }, [cart.items]);

  return (
    <div className="min-h-screen bg-[#F4F7ED] px-4 py-8 sm:px-6 lg:px-10">
      <Head title="Cart | PharmaConnect" />
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white/90 px-6 py-6 shadow-lg shadow-slate-200/50 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#2E6E65]">Your Cart</h1>
              <p className="mt-1 text-sm text-slate-600">Review your items before creating an order.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={clearCart}
                disabled={actionLoading || !cart.items.length}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#2E6E65] hover:text-[#2E6E65] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear Cart
              </button>
              <button
                type="button"
                onClick={createOrder}
                disabled={actionLoading || !cart.items.length}
                className="inline-flex items-center justify-center rounded-2xl bg-[#2E6E65] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#285a52] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? 'Processing...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_0.8fr]">
          <section className="overflow-hidden rounded-[2rem] bg-white/90 shadow-lg shadow-slate-200/40">
            <div className="border-b border-slate-200 px-6 py-4 sm:px-8">
              <h2 className="text-xl font-semibold text-[#2B3752]">Cart items</h2>
              <p className="mt-1 text-sm text-slate-500">Update quantities or remove products before checking out.</p>
            </div>

            <div className="min-w-full overflow-x-auto px-4 py-4 sm:px-6">
              {loading ? (
                <div className="space-y-3 py-10 text-center text-slate-500">Loading cart...</div>
              ) : cart.items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-slate-600">
                  <p className="text-lg font-medium">Your cart is empty.</p>
                  <p className="mt-2 text-sm">Add medicines from the pharmacy list to proceed.</p>
                  <div className="mt-6">
                    <Link
                      href="/pharmacies"
                      className="inline-flex rounded-2xl bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#43a047]"
                    >
                      Browse pharmacies
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <table className="min-w-full border-separate border-spacing-0 text-sm">
                    <thead className="bg-[#F4F7ED] text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="px-4 py-4 sm:px-6">Product</th>
                        <th className="px-4 py-4 text-right sm:px-6">Price</th>
                        <th className="px-4 py-4 text-right sm:px-6">Quantity</th>
                        <th className="px-4 py-4 text-right sm:px-6">Subtotal</th>
                        <th className="px-4 py-4 text-right sm:px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map((item) => {
                        const name = item.medicament?.name || item.name || 'Unknown medicament';
                        const price = Number(item.price ?? item.medicament?.price ?? 0);
                        const quantity = Number(item.quantity ?? 0);
                        const subtotal = price * quantity;

                        return (
                          <tr key={item.id} className="border-t border-slate-200">
                            <td className="px-4 py-4 sm:px-6">
                              <div className="max-w-[240px] text-sm font-medium text-slate-900">{name}</div>
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-slate-600 sm:px-6">${price.toFixed(2)}</td>
                            <td className="px-4 py-4 sm:px-6">
                              <div className="mx-auto flex max-w-[140px] items-center justify-end gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-sm">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, quantity - 1)}
                                  disabled={quantity <= 1 || actionLoading}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2E6E65] transition hover:bg-[#2E6E65]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  -
                                </button>
                                <span className="w-10 text-center text-sm text-slate-700">{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, quantity + 1)}
                                  disabled={actionLoading}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2E6E65] text-white transition hover:bg-[#285a52] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right text-sm font-semibold text-[#2E6E65] sm:px-6">${subtotal.toFixed(2)}</td>
                            <td className="px-4 py-4 text-right sm:px-6">
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                disabled={actionLoading}
                                className="rounded-2xl bg-[#4CAF50] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#43a047] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-[2rem] bg-[#2E6E65] px-6 py-6 text-white shadow-lg shadow-slate-200/30 sm:px-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#A7DBC7]">Order summary</p>
                <h2 className="mt-2 text-2xl font-semibold">Total</h2>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <div className="flex items-center justify-between text-sm text-slate-100">
                  <span>Items</span>
                  <span>{cart.items.length}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-3xl font-semibold text-white">
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={createOrder}
                disabled={cart.items.length === 0 || actionLoading}
                className="w-full rounded-3xl bg-[#4CAF50] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#43a047] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? 'Creating order...' : 'Create Order'}
              </button>
              <Link
                href="/pharmacies"
                className="block rounded-3xl border border-white/20 bg-white/10 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-white/20"
              >
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>

        {error && (
          <div className="rounded-3xl border border-[#E53E3E]/20 bg-[#FDE8E8] px-6 py-4 text-sm text-[#9B2C2C] shadow-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
