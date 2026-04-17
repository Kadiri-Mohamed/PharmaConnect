import { Head, Link, usePage } from '@inertiajs/react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';

export default function OrdersPage({ orders = [] }) {
    const { flash } = usePage().props;

    return (
        <Layout>
            <Head title="Orders" />

            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="mt-2 text-sm text-gray-600">All of your orders in one simple list.</p>
                </div>

                <FlashMessages flash={flash} />

                <div className="rounded-lg border bg-white p-6 shadow">
                    {orders.length === 0 ? (
                        <p className="text-sm text-gray-600">No orders yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-3 py-2">Order</th>
                                        <th className="px-3 py-2">Pharmacy</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Total</th>
                                        <th className="px-3 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b">
                                            <td className="px-3 py-2">
                                                <Link href={`/orders/${order.id}`} className="underline">
                                                    #{order.id}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-2">{order.pharmacy_name}</td>
                                            <td className="px-3 py-2">{order.status}</td>
                                            <td className="px-3 py-2">${Number(order.total_price || 0).toFixed(2)}</td>
                                            <td className="px-3 py-2">{new Date(order.created_at).toLocaleDateString()}</td>
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
