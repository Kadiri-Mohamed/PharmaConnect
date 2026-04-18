import { Head, Link, usePage } from '@inertiajs/react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';
import { formatCurrency, formatStatusLabel, getOrderStatusBadgeClass } from '@/utils/ui.js';

export default function OrdersPage({ orders = [] }) {
    const { flash } = usePage().props;

    return (
        <Layout>
            <Head title="Orders" />

            <div className="space-y-6">
                <div className="hero-card">
                    <p className="section-kicker">Purchase History</p>
                    <h1 className="mt-2 text-3xl font-semibold">Orders</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        Review each order, check its progress, and open the full detail view whenever you need it.
                    </p>
                </div>

                <FlashMessages flash={flash} />

                <div className="table-card">
                    {orders.length === 0 ? (
                        <p className="px-6 py-5 text-sm text-slate-500">No orders yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="table-head">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Order</th>
                                        <th className="px-4 py-3 font-semibold">Pharmacy</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Total</th>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="table-row">
                                            <td className="px-4 py-3">
                                                <Link href={`/orders/${order.id}`} className="link-primary">
                                                    #{order.id}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-pharmacy-deepest">
                                                {order.pharmacy_name}
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
