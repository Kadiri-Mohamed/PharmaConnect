import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

const statusStyles = {
  pending: 'bg-slate-100 text-slate-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready: 'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        headers: {
          Accept: 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Unable to fetch orders.');
      }

      const data = await response.json();
      setOrders(data.data || data.orders || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error loading orders.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head title="Orders | PharmaConnect" />
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white/95 px-6 py-8 shadow-lg shadow-slate-200/50 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#2E6E65]">Your Orders</h1>
              <p className="mt-1 text-sm text-slate-600">Track recent purchases and view order details.</p>
            </div>
            <div className="rounded-3xl bg-[#4CAF50] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-[#2E6E65]/10">
              {orders.length} order{orders.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] bg-white/90 shadow-lg shadow-slate-200/40">
          <div className="border-b border-slate-200 px-6 py-4 sm:px-8">
            <h2 className="text-xl font-semibold text-[#2B3752]">Order history</h2>
            <p className="mt-1 text-sm text-slate-500">Click an order to see the full details.</p>
          </div>

          <div className="px-4 py-4 sm:px-6">
            {loading ? (
              <div className="py-10 text-center text-slate-500">Loading orders...</div>
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">{error}</div>
            ) : orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-slate-600">
                <p className="text-lg font-medium">No orders yet.</p>
                <p className="mt-2 text-sm">Browse pharmacies and add items to your cart to create your first order.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className="bg-[#F4F7ED] text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-4 py-4 sm:px-6">Pharmacy</th>
                      <th className="px-4 py-4 sm:px-6">Status</th>
                      <th className="px-4 py-4 text-right sm:px-6">Total</th>
                      <th className="px-4 py-4 text-right sm:px-6">Date</th>
                      <th className="px-4 py-4 sm:px-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const status = String(order.status || '').toLowerCase();
                      const statusClass = statusStyles[status] || 'bg-slate-100 text-slate-700';
                      const date = order.created_at ? new Date(order.created_at).toLocaleDateString() : '-';
                      const total = Number(order.total_price ?? 0).toFixed(2);

                      return (
                        <tr key={order.id} className="border-t border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-4 sm:px-6">
                            <Link href={`/orders/${order.id}`} className="font-medium text-slate-900 transition hover:text-[#2E6E65]">
                              {order.pharmacy_name || order.pharmacy?.name || 'Unknown pharmacy'}
                            </Link>
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusClass}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900 sm:px-6">${total}</td>
                          <td className="px-4 py-4 text-right text-sm text-slate-600 sm:px-6">{date}</td>
                          <td className="px-4 py-4 text-right sm:px-6">
                            <Link
                              href={`/orders/${order.id}`}
                              className="inline-flex items-center rounded-full bg-[#2E6E65] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#285a52]"
                            >
                              View
                            </Link>
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
      </div>
    </Layout>
  );
}
