import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import AppLayout from '@/layouts/AppLayout.jsx';

const statusStyles = {
    pending: 'bg-slate-100 text-slate-700',
    preparing: 'bg-amber-100 text-amber-700',
    ready: 'bg-sky-100 text-sky-700',
    delivered: 'bg-emerald-100 text-emerald-700',
};

export default function ClientDashboard({
    recentOrders = [],
    cartSummary = { itemCount: 0, totalPrice: 0 },
}) {
    const recentSearches = useMemo(() => {
        try {
            const stored = localStorage.getItem('recent_medicament_searches');
            const parsed = stored ? JSON.parse(stored) : [];
            return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
        } catch {
            return [];
        }
    }, []);

    return (
        <AppLayout>
            <Head title="Client Dashboard" />

            <div className="space-y-6">
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#2E6E65]">Client Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-600">Track your recent orders and cart activity.</p>
                </section>

                <div className="grid gap-6 lg:grid-cols-3">
                    <section className="rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2B3752]">Cart Summary</h2>
                        <div className="mt-4 space-y-2">
                            <p className="text-sm text-slate-600">Items: <span className="font-semibold text-[#2B3752]">{cartSummary.itemCount}</span></p>
                            <p className="text-sm text-slate-600">
                                Total: <span className="font-semibold text-[#2B3752]">${Number(cartSummary.totalPrice ?? 0).toFixed(2)}</span>
                            </p>
                        </div>
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2B3752]">Recent Searches</h2>
                        {recentSearches.length === 0 ? (
                            <p className="mt-4 text-sm text-slate-500">No recent searches.</p>
                        ) : (
                            <ul className="mt-4 space-y-2 text-sm text-slate-700">
                                {recentSearches.map((term, index) => (
                                    <li key={`${term}-${index}`} className="rounded-lg bg-[#F4F7ED] px-3 py-2">
                                        {term}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2B3752]">Quick Actions</h2>
                        <div className="mt-4 flex flex-col gap-3">
                            <Link href="/medicaments" className="rounded-lg bg-[#2E6E65] px-4 py-2 text-sm font-semibold text-white hover:bg-[#275f58]">
                                Browse Medicaments
                            </Link>
                            <Link href="/pharmacies" className="rounded-lg bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white hover:bg-[#409444]">
                                View Pharmacies
                            </Link>
                        </div>
                    </section>
                </div>

                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#2B3752]">Recent Orders</h2>
                        <Link href="/orders" className="text-sm font-semibold text-[#2E6E65] hover:underline">
                            View all
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-slate-500">No recent orders.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-2 py-3">Pharmacy</th>
                                        <th className="px-2 py-3">Status</th>
                                        <th className="px-2 py-3">Total</th>
                                        <th className="px-2 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => {
                                        const status = String(order.status || '').toLowerCase();
                                        const statusClass = statusStyles[status] ?? 'bg-slate-100 text-slate-700';
                                        const formattedDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : '-';

                                        return (
                                            <tr key={order.id} className="border-b border-slate-100">
                                                <td className="px-2 py-3 text-[#2B3752]">{order.pharmacy_name ?? 'Unknown pharmacy'}</td>
                                                <td className="px-2 py-3">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{status}</span>
                                                </td>
                                                <td className="px-2 py-3 font-medium text-[#2B3752]">${Number(order.total_price ?? 0).toFixed(2)}</td>
                                                <td className="px-2 py-3 text-slate-600">{formattedDate}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
