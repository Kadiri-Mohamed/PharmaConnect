import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function PharmacienDashboard() {
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
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch pharmacy info
      const pharmacyResponse = await fetch('/api/pharmacien/pharmacy', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });

      if (!pharmacyResponse.ok) {
        throw new Error('Unable to load pharmacy information.');
      }

      const pharmacyData = await pharmacyResponse.json();

      // Fetch medicaments
      const medicamentsResponse = await fetch('/api/pharmacien/medicaments', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });

      const medicamentsData = await medicamentsResponse.json();

      // Fetch orders
      const ordersResponse = await fetch('/api/pharmacien/orders', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });

      const ordersData = await ordersResponse.json();

      // Calculate stats
      const medicaments = medicamentsData.data || medicamentsData.medicaments || [];
      const orders = ordersData.data || ordersData.orders || [];
      const lowStockCount = medicaments.filter(item => Number(item.stock ?? 0) <= 20).length;

      setDashboard({
        pharmacy: pharmacyData.data || pharmacyData.pharmacy || pharmacyData,
        medicaments,
        orders,
        stats: {
          totalMedicaments: medicaments.length,
          lowStockCount,
          totalOrders: orders.length,
        },
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unexpected error loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const recentOrders = dashboard.orders.slice(0, 5);
  const lowStockMedicaments = dashboard.medicaments.filter(item => Number(item.stock ?? 0) <= 20);

  return (
    <div className="min-h-screen bg-[#F4F7ED] px-4 py-8 sm:px-6 lg:px-10">
      <Head title="Dashboard | PharmaConnect" />
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white/95 px-6 py-8 shadow-lg shadow-slate-200/50 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#2E6E65]">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">
                Welcome back, {dashboard.pharmacy?.name || 'Pharmacist'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-3xl bg-[#2B3752] px-4 py-3 text-sm font-semibold text-white shadow-sm">
                {dashboard.pharmacy?.status_garde ? 'De garde' : 'Normal hours'}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-[#2E6E65] p-6 text-white shadow-lg shadow-slate-200/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#A7DBC7]">Total medicaments</p>
                <p className="mt-2 text-3xl font-semibold">{dashboard.stats.totalMedicaments}</p>
              </div>
              <div className="rounded-full bg-white/10 p-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#2B3752] p-6 text-white shadow-lg shadow-slate-200/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Low stock alerts</p>
                <p className="mt-2 text-3xl font-semibold">{dashboard.stats.lowStockCount}</p>
                <p className="mt-1 text-xs text-slate-300">Items with ≤20 units</p>
              </div>
              <div className="rounded-full bg-white/10 p-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#4CAF50] p-6 text-white shadow-lg shadow-slate-200/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-green-100">Total orders</p>
                <p className="mt-2 text-3xl font-semibold">{dashboard.stats.totalOrders}</p>
                <p className="mt-1 text-xs text-green-100">This month</p>
              </div>
              <div className="rounded-full bg-white/10 p-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/40">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-xl font-semibold text-[#2B3752]">Low stock alerts</h2>
              <Link
                href="/pharmacien/medicaments"
                className="rounded-2xl bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#285a52]"
              >
                Manage medicaments
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="py-8 text-center text-slate-500">Loading alerts...</div>
              ) : lowStockMedicaments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-slate-600">
                  <p className="text-sm font-medium">All medicaments are well stocked!</p>
                  <p className="mt-1 text-xs">No items below 20 units.</p>
                </div>
              ) : (
                lowStockMedicaments.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-3xl border border-amber-200 bg-amber-50 p-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">Stock: {item.stock} units</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Low stock
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/40">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-xl font-semibold text-[#2B3752]">Recent orders</h2>
              <Link
                href="/pharmacien/orders"
                className="rounded-2xl bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#285a52]"
              >
                Manage orders
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="py-8 text-center text-slate-500">Loading orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-slate-600">
                  <p className="text-sm font-medium">No orders yet.</p>
                  <p className="mt-1 text-xs">Orders will appear here when customers place them.</p>
                </div>
              ) : (
                recentOrders.map((order) => {
                  const status = String(order.status || '').toLowerCase();
                  const statusStyles = {
                    pending: 'bg-slate-100 text-slate-700',
                    preparing: 'bg-amber-100 text-amber-700',
                    ready: 'bg-sky-100 text-sky-700',
                    delivered: 'bg-emerald-100 text-emerald-700',
                  };
                  const statusClass = statusStyles[status] || 'bg-slate-100 text-slate-700';
                  const date = order.created_at ? new Date(order.created_at).toLocaleDateString() : '-';
                  const total = Number(order.total_price ?? 0).toFixed(2);

                  return (
                    <div key={order.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="font-medium text-slate-900">Order #{order.id}</p>
                        <p className="text-sm text-slate-600">${total} • {date}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusClass}`}>
                        {status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
