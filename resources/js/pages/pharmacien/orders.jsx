import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import FlashMessages from '@/components/FlashMessages.jsx';
import Layout from '@/layouts/Layout.jsx';

const statuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function PharmacienOrdersPage({ orders = [] }) {
    const { flash } = usePage().props;
    const [selected, setSelected] = useState({});
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        setSelected(Object.fromEntries(orders.map((order) => [order.id, order.status])));
    }, [orders]);

    const save = (orderId) => {
        router.patch(`/pharmacien/orders/${orderId}/status`, { status: selected[orderId] }, { preserveScroll: true, onStart: () => setSavingId(orderId), onFinish: () => setSavingId(null) });
    };

    return (
        <Layout>
            <Head title="Manage Orders" />

            <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6 shadow">
                    <h1 className="text-2xl font-bold">Manage Orders</h1>
                    <p className="mt-2 text-sm text-gray-600">Update order statuses without filters or extra steps.</p>
                </div>

                <FlashMessages flash={flash} />

                <div className="rounded-lg border bg-white p-6 shadow">
                    {orders.length === 0 ? (
                        <p className="text-sm text-gray-600">No orders found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b">
                                    <tr>
                                        <th className="px-3 py-2">Order</th>
                                        <th className="px-3 py-2">Client</th>
                                        <th className="px-3 py-2">Items</th>
                                        <th className="px-3 py-2">Total</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b">
                                            <td className="px-3 py-2">#{order.id}</td>
                                            <td className="px-3 py-2">{order.user_name}</td>
                                            <td className="px-3 py-2">{order.items.map((item) => `${item.name} (${item.quantity})`).join(', ')}</td>
                                            <td className="px-3 py-2">${Number(order.total_price || 0).toFixed(2)}</td>
                                            <td className="px-3 py-2">
                                                <select value={selected[order.id] || order.status} onChange={(event) => setSelected({ ...selected, [order.id]: event.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                                                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <button type="button" onClick={() => save(order.id)} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" disabled={savingId === order.id}>
                                                    {savingId === order.id ? 'Saving...' : 'Save'}
                                                </button>
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
