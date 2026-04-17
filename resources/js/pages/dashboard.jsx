import { Head, Link } from '@inertiajs/react';
import Layout from '@/layouts/Layout.jsx';

export default function Dashboard({ recentOrders = [], cartSummary = { itemCount: 0, totalPrice: 0 } }) {
    return (
        <Layout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Client Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-600">A simple overview of your cart and latest orders.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Cart Items</p>
                        <p className="mt-2 text-3xl font-bold">{cartSummary.itemCount}</p>
                    </div>
                    <div className="rounded-lg border bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Cart Total</p>
                        <p className="mt-2 text-3xl font-bold">${Number(cartSummary.totalPrice || 0).toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border bg-white p-5 shadow">
                        <p className="text-sm text-gray-500">Quick Links</p>
                        <div className="mt-3 flex gap-2">
                            <Link href="/medicaments" className="rounded-lg border px-3 py-2 text-sm">
                                Medicaments
                            </Link>
                            <Link href="/cart" className="rounded-lg border px-3 py-2 text-sm">
                                Cart
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent Orders</h2>
                        <Link href="/orders" className="text-sm text-gray-600 underline">
                            View all
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-gray-600">No orders yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-3 py-2">Pharmacy</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Total</th>
                                        <th className="px-3 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b">
                                            <td className="px-3 py-2">{order.pharmacy_name || 'Unknown pharmacy'}</td>
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
