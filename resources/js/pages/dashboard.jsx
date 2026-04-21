import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';
import { formatCurrency, formatStatusLabel, getOrderStatusBadgeClass } from '@/utils/ui.js';

export default function Dashboard({ recentOrders = [], cartSummary = { itemCount: 0, totalPrice: 0 } }) {
    return (
        <Layout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Client Portal</p>
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold">Client Dashboard</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                Keep an eye on your cart, current spending, and the latest activity from your
                                orders.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/medicaments" className="btn-secondary">
                                Browse medicaments
                            </Link>
                            <Link href="/cart" className="btn-primary">
                                Open cart
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="page-card bg-gradient from-pharmacy-light via-white to-pharmacy-lighter/70 hover:scale-[1.02]">
                        <p className="section-kicker">Cart Items</p>
                        <p className="mt-3 text-3xl font-bold text-pharmacy-dark">{cartSummary.itemCount}</p>
                        <p className="mt-2 text-sm text-slate-600">Items currently waiting for checkout.</p>
                    </div>
                    <div className="page-card bg-gradient from-pharmacy-light via-white to-pharmacy-lighter/70 hover:scale-[1.02]">
                        <p className="section-kicker">Cart Total</p>
                        <p className="mt-3 text-3xl font-bold text-pharmacy-dark">
                            {formatCurrency(cartSummary.totalPrice)}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">A live total based on the items in your cart.</p>
                    </div>
                    <div className="page-card bg-gradient from-pharmacy-light via-white to-pharmacy-lighter/70 hover:scale-[1.02]">
                        <p className="section-kicker">Quick Actions</p>
                        <p className="mt-3 text-lg font-semibold text-pharmacy-deepest">
                            Pick up where you left off.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link href="/medicaments" className="btn-secondary">
                                Medicaments
                            </Link>
                            <Link href="/orders" className="btn-secondary">
                                Orders
                            </Link>
                            <Link href="/cart" className="btn-primary">
                                Cart
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="table-card">
                    <div className="flex items-center justify-between border-b border-pharmacy-light/70 px-6 py-5">
                        <div>
                            <p className="section-kicker">Recent Activity</p>
                            <h2 className="mt-2 text-xl font-semibold">Latest Orders</h2>
                        </div>
                        <Link href="/orders" className="link-primary text-sm">
                            View all
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="px-6 py-5 text-sm text-slate-500">No orders yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="table-head">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Pharmacy</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Total</th>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="table-row">
                                            <td className="px-4 py-3 font-medium text-pharmacy-deepest">
                                                {order.pharmacy_name || 'Unknown pharmacy'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={getOrderStatusBadgeClass(order.status)}>
                                                    {formatStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-pharmacy-dark">
                                                {formatCurrency(order.total_price)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
